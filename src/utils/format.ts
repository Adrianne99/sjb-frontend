// Display formatters (Philippine locale). These only FORMAT values the backend
// already calculated — never compute balances or grades here.

const pesoFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

/** "30000.00" -> "₱30,000.00" */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return pesoFormatter.format(Number(value));
}

/** True when a money string is above zero. */
export function isPositiveAmount(value: string | number | null | undefined): boolean {
  return Number(value ?? 0) > 0.004;
}

/** "2026-10-01" -> "Oct 1, 2026" (date-only values, no timezone shifting). */
export function formatDate(value: string | null | undefined, style: "short" | "long" = "short"): string {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-PH", {
    timeZone: "UTC",
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  });
}

/** ISO timestamp -> "Oct 1, 2026, 4:30 PM" in Philippine time. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "13:30" -> "1:30 PM" */
export function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** 1 -> "1st Year", 11 -> "Grade 11" (Senior High School) */
export function formatYearLevel(level: number | null | undefined): string {
  if (!level) return "—";
  if (level >= 7) return `Grade ${level}`;
  const suffix = level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th";
  return `${level}${suffix} Year`;
}

/** "2026-05" -> "May 2026" */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-PH", { timeZone: "UTC", month: "short", year: "numeric" });
}

/** Today's date (Philippine time) as "YYYY-MM-DD" — a default for date inputs. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Where a class meets: the room code, or "Online". */
export function classLocation(slot: { mode: "FACE_TO_FACE" | "ONLINE"; room: { code: string } | null }): string {
  return slot.mode === "ONLINE" ? "Online" : (slot.room?.code ?? "No room");
}
