// Guest user rate limiting utility
// Uses localStorage to track query count (simple client-side implementation)

const GUEST_QUERY_LIMIT = 5;
const STORAGE_KEY = "guest_query_count";

export const getGuestQueryCount = (): number => {
  if (typeof window === "undefined") return 0;
  const count = localStorage.getItem(STORAGE_KEY);
  return count ? parseInt(count, 10) : 0;
};

export const incrementGuestQueryCount = (): number => {
  if (typeof window === "undefined") return 0;
  const currentCount = getGuestQueryCount();
  const newCount = currentCount + 1;
  localStorage.setItem(STORAGE_KEY, newCount.toString());
  return newCount;
};

export const resetGuestQueryCount = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const isGuestLimitReached = (): boolean => {
  return getGuestQueryCount() >= GUEST_QUERY_LIMIT;
};

export const canGuestQuery = (): boolean => {
  return getGuestQueryCount() < GUEST_QUERY_LIMIT;
};

export const getGuestQueriesRemaining = (): number => {
  return Math.max(0, GUEST_QUERY_LIMIT - getGuestQueryCount());
};
