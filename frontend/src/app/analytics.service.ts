import { Injectable } from '@angular/core';

export type AnalyticsEvent = 'course_progress_viewed' | 'progress_refreshed';

/**
 * Stub analytics client: one structured JSON line per event on the console.
 * Swap the body of `track` for Segment/Amplitude/etc. without touching call sites.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}): void {
    console.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...properties }));
  }
}
