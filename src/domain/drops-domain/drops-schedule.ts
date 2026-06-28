type Schedule = {
  kind: string;
  dates?: string[];
  start?: string;
  end?: string;
  days?: string[];
};

const WEEKDAY_FROM_SHORT: Record<string, string> = {
  Mon: "MON",
  Tue: "TUE",
  Wed: "WED",
  Thu: "THU",
  Fri: "FRI",
  Sat: "SAT",
  Sun: "SUN",
};

function parseHm(s: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

function minutesOfDayInTimezone(now: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function dateStringInTimezone(now: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function weekdayCodeInTimezone(now: Date, timezone: string): string | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).formatToParts(now);
  const short = parts.find((p) => p.type === "weekday")?.value;
  if (!short) return null;
  return WEEKDAY_FROM_SHORT[short] ?? null;
}

/**
 * Returns whether the mission schedule is active at `now` in `timezone` (IANA).
 */
export function isScheduleActive(schedule: Schedule, now: Date, timezone: string): boolean {
  switch (schedule.kind) {
    case "always":
      return true;
    case "calendar_date": {
      const d = dateStringInTimezone(now, timezone);
      return Boolean(schedule.dates?.includes(d));
    }
    case "time_of_day": {
      if (!schedule.start || !schedule.end) return false;
      const start = parseHm(schedule.start);
      const end = parseHm(schedule.end);
      if (!start || !end) return false;
      const cur = minutesOfDayInTimezone(now, timezone);
      const a = start.h * 60 + start.m;
      const b = end.h * 60 + end.m;
      if (a <= b) {
        return cur >= a && cur < b;
      }
      // overnight window
      return cur >= a || cur < b;
    }
    case "weekday": {
      const code = weekdayCodeInTimezone(now, timezone);
      if (!code || !schedule.days?.length) return false;
      return schedule.days.includes(code);
    }
    default:
      return false;
  }
}
