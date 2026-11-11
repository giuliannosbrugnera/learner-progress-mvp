import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { AnalyticsService } from './analytics.service';
import type { CourseProgress } from './types';

function course(overrides: Partial<CourseProgress> = {}): CourseProgress {
  return {
    courseId: 'c1',
    title: 'Course One',
    completionPercentage: 50,
    lastActivityAt: new Date().toISOString(),
    status: 'in_progress',
    isStale: false,
    estimatedMinutesRemaining: 20,
    ...overrides,
  };
}

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  let analytics: jasmine.SpyObj<AnalyticsService>;

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const url = (learnerId: number) => `/api/learners/${learnerId}/progress`;

  function flushCourses(courses: CourseProgress[], learnerId = 1): void {
    http.expectOne(url(learnerId)).flush({ learnerId, courses });
    fixture.detectChanges();
  }

  beforeEach(() => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AnalyticsService, useValue: analytics },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    fixture.detectChanges(); // runs ngOnInit and fires the request
  });

  afterEach(() => http.verify());

  it('shows a loading state until the request completes', () => {
    expect(text()).toContain('Loading your courses');
    flushCourses([course()]);
    expect(text()).not.toContain('Loading your courses');
  });

  it('renders completion, time left, last activity and the Inactive badge', () => {
    flushCourses([
      course({ title: 'Fresh', completionPercentage: 33, estimatedMinutesRemaining: 90 }),
      course({ courseId: 'c2', title: 'Old', isStale: true }),
    ]);
    const rendered = text();
    expect(rendered).toContain('Fresh');
    expect(rendered).toContain('33% complete');
    expect(rendered).toContain('~1 h 30 min left');
    expect(rendered).toContain('last activity');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.badge').length).toBe(1);
  });

  it('shows the empty state when there are no in-progress courses', () => {
    flushCourses([]);
    expect(text()).toContain('No courses in progress');
  });

  it('shows the API error message with a retry button on 404', () => {
    http.expectOne(url(1)).flush({ error: 'Learner 1 not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(text()).toContain('Learner 1 not found');
    expect(text()).toContain('Try again');
  });

  it('explains an unreachable backend when a 5xx has no JSON body', () => {
    http.expectOne(url(1)).flush('', { status: 500, statusText: 'Proxy error' });
    fixture.detectChanges();
    expect(text()).toContain('Could not reach the server');
  });

  it('filters out courses with 30 minutes or more left, and can be reset', () => {
    flushCourses([
      course({ courseId: 'short', title: 'Short one', estimatedMinutesRemaining: 29 }),
      course({ courseId: 'long', title: 'Long one', estimatedMinutesRemaining: 30 }),
    ]);
    const checkbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[type=checkbox]')!;
    checkbox.click();
    fixture.detectChanges();
    expect(text()).toContain('Short one');
    expect(text()).not.toContain('Long one');
    checkbox.click();
    fixture.detectChanges();
    expect(text()).toContain('Long one');
  });

  it('explains when the filter hides every course', () => {
    flushCourses([course({ estimatedMinutesRemaining: 45 })]);
    fixture.componentInstance.setShortOnly(true);
    fixture.detectChanges();
    expect(text()).toContain('No courses with under 30 min left');
    expect(text()).toContain('Show all 1 courses');
  });

  it('tracks course_progress_viewed with counts on the first load', () => {
    flushCourses([course(), course({ courseId: 'c2', isStale: true })]);
    expect(analytics.track).toHaveBeenCalledOnceWith('course_progress_viewed', {
      learnerId: 1,
      trigger: 'initial',
      courseCount: 2,
      staleCount: 1,
    });
  });

  it('tracks progress_refreshed when the learner refreshes', () => {
    flushCourses([course()]);
    analytics.track.calls.reset();
    fixture.componentInstance.refresh();
    flushCourses([course()]);
    expect(analytics.track).toHaveBeenCalledOnceWith(
      'progress_refreshed',
      jasmine.objectContaining({ learnerId: 1, trigger: 'refresh' }),
    );
  });

  it('cancels the in-flight request when the learner changes', () => {
    const first = http.expectOne(url(1));
    fixture.componentInstance.selectLearner(2);
    expect(first.cancelled).toBeTrue();
    flushCourses([course({ title: 'Learner two course' })], 2);
    expect(text()).toContain('Learner two course');
  });
});
