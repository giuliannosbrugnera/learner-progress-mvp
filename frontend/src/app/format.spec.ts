import { formatMinutes, formatRelative } from './format';

describe('formatMinutes', () => {
  it('shows minutes under an hour', () => {
    expect(formatMinutes(0)).toBe('0 min');
    expect(formatMinutes(25)).toBe('25 min');
    expect(formatMinutes(59)).toBe('59 min');
  });

  it('shows whole hours without a minutes part', () => {
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(120)).toBe('2 h');
  });

  it('shows hours and remaining minutes', () => {
    expect(formatMinutes(90)).toBe('1 h 30 min');
  });
});

describe('formatRelative', () => {
  const now = Date.UTC(2026, 10, 11, 12, 0, 0);
  const ago = (ms: number) => new Date(now - ms).toISOString();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  it('uses minutes below an hour', () => {
    expect(formatRelative(ago(5 * minute), now)).toBe('5 minutes ago');
  });

  it('uses hours below a day', () => {
    expect(formatRelative(ago(3 * hour), now)).toBe('3 hours ago');
  });

  it('uses days from a day up, with "yesterday" for one day', () => {
    expect(formatRelative(ago(day), now)).toBe('yesterday');
    expect(formatRelative(ago(4 * day), now)).toBe('4 days ago');
    expect(formatRelative(ago(54 * day), now)).toBe('54 days ago');
  });
});
