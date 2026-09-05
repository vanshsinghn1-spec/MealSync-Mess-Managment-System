import useSWR from "swr";
import api from "@/lib/api";

// Generic fetcher for SWR — uses the existing Axios instance with auth interceptors
const fetcher = (url: string) => api.get(url).then((res) => res.data);

/**
 * Hook: useTodayMenu
 *
 * Fetches ALL meal data for today in a single request via GET /menu/today/all.
 * Returns pre-grouped data by meal type so tab switching is instant (no network calls).
 *
 * SWR config:
 * - revalidateOnFocus: false — avoid refetching when user switches tabs in the browser
 * - dedupingInterval: 60s — deduplicate identical requests within 60 seconds
 */
export function useTodayMenu() {
  const { data, error, isLoading, mutate } = useSWR("/menu/today/all", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    revalidateIfStale: true,
  });

  return {
    /** Full response payload */
    data,
    /** Grouped meals object: { breakfast: { vegMenus, nonVegMenus }, lunch: {...}, ... } */
    meals: data?.meals || null,
    /** Today's day name (e.g. "Monday") */
    day: (data?.day as string) || "",
    /** Current week type ("odd" | "even") */
    weekType: (data?.weekType as string) || "",
    /** Server-determined current meal based on IST */
    currentMeal: (data?.currentMeal as string) || "breakfast",
    /** True while the initial fetch is in-flight (no cached data available) */
    isLoading,
    /** Error object if the request failed */
    error,
    /** Manually trigger revalidation */
    mutate,
  };
}

/**
 * Hook: useWeeklyMenu
 *
 * Fetches the full weekly menu grid for a specific mess and week type.
 * Cache key includes messId + weekType so each combination is cached independently.
 *
 * @param messId - MongoDB ObjectId of the mess hall
 * @param weekType - "odd" or "even"
 * @param shouldFetch - Pass false to disable fetching (e.g. before session is ready)
 */
export function useWeeklyMenu(
  messId: string | null,
  weekType: string,
  shouldFetch: boolean = true
) {
  const key = messId && shouldFetch ? `/menu/weekly/${messId}?weekType=${weekType}` : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    revalidateIfStale: true,
  });

  return {
    /** The weekly menu grid object, keyed by day name */
    weekly: data?.weekly || null,
    /** Week type from the server response */
    weekType: data?.weekType || weekType,
    /** True while the initial fetch is in-flight */
    isLoading,
    /** Error object if the request failed */
    error,
    /** Manually trigger revalidation */
    mutate,
  };
}
