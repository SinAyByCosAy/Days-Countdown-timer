// Shared countdown math + storage adapter.
const MS_DAY = 86_400_000;
export const STORAGE_KEY = "remainingDays_v1";

export function toISO(d) {
  const t = new Date(d);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const day = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateOnly(d) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatShort(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLong(d) {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / MS_DAY);
}

/**
 * Compute all countdown metrics from a saved state.
 * @param {{targetDate:string,startDate?:string|null,setOn?:string,label?:string}} state
 */
export function computeCountdown(state, now = new Date()) {
  const target = parseISO(state.targetDate);
  const targetEnd = new Date(target);
  targetEnd.setHours(23, 59, 59, 999);
  const start = state.startDate
    ? parseISO(state.startDate)
    : parseISO(state.setOn || toISO(now));

  const daysRemaining = Math.max(
    0,
    Math.round((toDateOnly(target) - toDateOnly(now)) / MS_DAY)
  );

  const msLeft = Math.max(0, targetEnd - now);
  const totalSeconds = Math.floor(msLeft / 1000);
  const hoursLeft = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
  const secondsLeft = totalSeconds % 60;

  const totalSpan = Math.max(1, targetEnd - start);
  const elapsed = Math.min(totalSpan, Math.max(0, now - start));
  const percent = (elapsed / totalSpan) * 100;

  return {
    daysRemaining,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    percent,
    target,
    start,
    isOver: now >= targetEnd,
  };
}

// localStorage-based storage (extension uses chrome.storage.local instead)
export const storage = {
  get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
