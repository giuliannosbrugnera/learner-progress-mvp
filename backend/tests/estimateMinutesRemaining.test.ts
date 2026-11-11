import {
  DEFAULT_LESSON_MINUTES,
  estimateMinutesRemaining,
} from '../src/services/progressService';
import type { CourseEnrollment, Lesson } from '../src/types';

function enrollmentWith(lessons: Lesson[]): CourseEnrollment {
  return {
    courseId: 'c',
    title: 'Course',
    learnerId: 1,
    lessons,
    lastActivityAt: new Date().toISOString(),
    status: 'in_progress',
  };
}

describe('estimateMinutesRemaining', () => {
  it('sums durations of incomplete lessons only', () => {
    const e = enrollmentWith([
      { id: 'a', title: 'A', completed: true, durationMinutes: 30 },
      { id: 'b', title: 'B', completed: false, durationMinutes: 20 },
      { id: 'c', title: 'C', completed: false, durationMinutes: 5 },
    ]);
    expect(estimateMinutesRemaining(e)).toBe(25);
  });

  it('falls back to the default duration for lessons without one', () => {
    const e = enrollmentWith([
      { id: 'a', title: 'A', completed: false },
      { id: 'b', title: 'B', completed: false, durationMinutes: 20 },
    ]);
    expect(estimateMinutesRemaining(e)).toBe(DEFAULT_LESSON_MINUTES + 20);
  });

  it('returns 0 when every lesson is complete', () => {
    const e = enrollmentWith([{ id: 'a', title: 'A', completed: true }]);
    expect(estimateMinutesRemaining(e)).toBe(0);
  });

  it('returns 0 for a course with no lessons', () => {
    expect(estimateMinutesRemaining(enrollmentWith([]))).toBe(0);
  });
});
