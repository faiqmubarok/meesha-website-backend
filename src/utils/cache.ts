type CacheItem<T> = {
  data: T;
  timestamp: number;
};

const cacheStore: {
  categories?: CacheItem<any>;
  types?: CacheItem<any>;
  objectives?: CacheItem<any>;
  colors?: CacheItem<any>;
} = {};

const CACHE_TTL = 1000 * 60 * 60;

export const getCachedData = <T>(key: keyof typeof cacheStore): T | null => {
  const cached = cacheStore[key];
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    cacheStore[key] = undefined;
    return null;
  }

  return cached.data as T;
};

export const setCachedData = <T>(key: keyof typeof cacheStore, data: T) => {
  cacheStore[key] = {
    data,
    timestamp: Date.now(),
  };
};
