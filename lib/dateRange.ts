export type RangeKind = "today" | "this-week" | "this-month" | "all";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function getPredefinedRange(kind: RangeKind): DateRange {
  const now = new Date();

  switch (kind) {
    case "today": {
      return { from: startOfDay(now), to: endOfDay(now) };
    }
    case "this-week": {
      const day = now.getDay();
      const diff = (day + 6) % 7; // convert Sunday(0) -> 6
      const monday = startOfDay(new Date(now));
      monday.setDate(now.getDate() - diff);
      const sunday = endOfDay(new Date(monday));
      sunday.setDate(monday.getDate() + 6);
      return { from: monday, to: sunday };
    }
    case "this-month": {
      const first = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      const last = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      return { from: first, to: last };
    }
    case "all":
    default:
      return { from: null, to: null };
  }
}

export function isWithinRange(isoString: string, range: DateRange): boolean {
  const value = new Date(isoString);
  if (Number.isNaN(value.getTime())) return false;
  if (range.from && value < range.from) return false;
  if (range.to && value > range.to) return false;
  return true;
}
