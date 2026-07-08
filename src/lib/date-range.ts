/** Resolve a named period ("today" | "week" | "month" | "year") to a date range. */
export function periodRange(period?: string): { from: Date; to: Date } | null {
  if (!period) return null;
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let from: Date;
  switch (period) {
    case "today":
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week": {
      const day = now.getDay(); // 0 = Sun
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      break;
    }
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      return null;
  }
  return { from, to };
}
