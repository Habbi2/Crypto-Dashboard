// Local storage caching service for crypto data
const CACHE_PREFIX = 'crypto_dashboard_';
export const CACHE_EXPIRY = {
  PRICE_DATA: 5 * 60 * 1000, // 5 minutes
  CHART_DATA: 30 * 60 * 1000, // 30 minutes
  SYMBOLS_DATA: 24 * 60 * 60 * 1000, // 24 hours
  GLOBAL_DATA: 15 * 60 * 1000, // 15 minutes
};

// Save data to cache with expiration time
export const saveToCache = (key, data, expiry = CACHE_EXPIRY.PRICE_DATA) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiry
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    // If localStorage is full, clear older items
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCacheEntries();
    }
    return false;
  }
};

// Get data from cache if it exists and isn't expired
export const getFromCache = (key) => {
  try {
    const cachedItem = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cachedItem) return null;
    
    const { data, timestamp, expiry } = JSON.parse(cachedItem);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - timestamp > expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
};

// Clear all cached data
export const clearCache = () => {
  try {
    // Only clear items with our prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Clear only expired cache entries
export const clearExpiredCache = () => {
  try {
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cachedItem = JSON.parse(localStorage.getItem(key));
          if (cachedItem && now - cachedItem.timestamp > cachedItem.expiry) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // If item can't be parsed, remove it
          localStorage.removeItem(key);
        }
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return false;
  }
};

// Clear older cache entries when storage is full
export const clearOldCacheEntries = () => {
  try {
    const cacheItems = [];
    
    // Get all cache items with our prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          cacheItems.push({
            key,
            timestamp: item.timestamp
          });
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });
    
    // Sort by age (oldest first) and remove 20% of them
    if (cacheItems.length > 0) {
      cacheItems.sort((a, b) => a.timestamp - b.timestamp);
      
      const itemsToRemove = Math.ceil(cacheItems.length * 0.2);
      cacheItems.slice(0, itemsToRemove).forEach(item => {
        localStorage.removeItem(item.key);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing old cache entries:', error);
    return false;
  }
};

// Generate cache key for various data types
export const getCacheKey = {
  priceData: (symbol) => `price_${symbol}`,
  chartData: (symbol, interval, limit) => `chart_${symbol}_${interval}_${limit}`,
  marketData: (baseCurrency, limit) => `market_${baseCurrency}_${limit}`,
  symbols: () => 'symbols',
  globalData: () => 'global_data'
};