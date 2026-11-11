import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { formatMinutes, formatRelative } from './format';
import type { CourseProgress, LearnerProgressResponse } from './types';

/** Stub auth: the learner is picked from a dropdown. 3 and 999 exist to demo empty/error states. */
const LEARNERS = [
  { id: 1, label: 'Learner 1' },
  { id: 2, label: 'Learner 2' },
  { id: 3, label: 'Learner 3 (empty state demo)' },
  { id: 999, label: 'Learner 999 (error state demo)' },
];

/** "Short" filter for the time-remaining rule: courses finishable in one sitting. */
export const SHORT_COURSE_MINUTES = 30;

type LoadTrigger ='initial' | 'learner_changed' | 'refresh';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly analytics = inject(AnalyticsService);
  private request?: Subscription;

  readonly learners = LEARNERS;
  readonly learnerId = signal(LEARNERS[0].id);
  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly courses = signal<CourseProgress[]>([]);
  readonly errorMessage = signal('');

  readonly shortCourseMinutes = SHORT_COURSE_MINUTES;
  readonly shortOnly = signal(false);
  readonly visibleCourses = computed(() =>
    this.shortOnly()
      ? this.courses().filter((course) => course.estimatedMinutesRemaining < SHORT_COURSE_MINUTES)
      : this.courses(),
  );

  readonly formatRelative = formatRelative;
  readonly formatMinutes = formatMinutes;

  ngOnInit(): void {
    this.load('initial');
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }

  selectLearner(id: number): void {
    this.learnerId.set(id);
    this.load('learner_changed');
  }

  setShortOnly(value: boolean): void {
    this.shortOnly.set(value);
  }

  refresh(): void {
    this.load('refresh');
  }

  private load(trigger: LoadTrigger): void {
    // Cancel any in-flight request so a slow response for a previous learner can't overwrite this one.
    this.request?.unsubscribe();
    this.status.set('loading');

    const learnerId = this.learnerId();
    this.request = this.http.get<LearnerProgressResponse>(`/api/learners/${learnerId}/progress`).subscribe({
      next: (body) => {
        this.courses.set(body.courses);
        this.status.set('ready');
        this.analytics.track(trigger === 'refresh' ? 'progress_refreshed' : 'course_progress_viewed', {
          learnerId,
          trigger,
          courseCount: body.courses.length,
          staleCount: body.courses.filter((course) => course.isStale).length,
        });
      },
      error: (err: HttpErrorResponse) => {
        this.courses.set([]);
        this.errorMessage.set(describeError(err));
        this.status.set('error');
      },
    });
  }
}

function describeError(err: HttpErrorResponse): string {
  // The API always answers with { error: string }. No such body on a network failure (status 0)
  // or a 5xx means the dev proxy could not reach the backend.
  if (err.error?.error) {
    return err.error.error;
  }
  if (err.status === 0 || err.status >= 500) {
    return 'Could not reach the server. Make sure the backend is running on port 3001.';
  }
  return `Something went wrong (HTTP ${err.status}).`;
}
