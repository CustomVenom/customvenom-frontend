export const CACHE = {
  projections: {
    staleTime: 5 * 60 * 1000, // 5m
    gcTime: 30 * 60 * 1000,   // 30m (cacheTime in v5 is gcTime)
  },
  roster: {
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },
};

