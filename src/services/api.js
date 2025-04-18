import axios from 'axios';
import { getFromCache, saveToCache, getCacheKey, CACHE_EXPIRY } from './cacheService';

// Binance API endpoints
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
// CoinGecko API for global market data
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Fetch list of available coins/symbols from Binance
export const fetchAvailableSymbols = async () => {
    // Try to get from cache first
    const cacheKey = getCacheKey.symbols();
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    try {
        const response = await axios.get(`${BINANCE_API_BASE}/exchangeInfo`);
        // Extract symbol information from the response
        const symbols = response.data.symbols
            .filter(symbol => symbol.quoteAsset === 'USDT') // Filter for USDT pairs for simplicity
            .map(symbol => ({
                id: symbol.symbol,
                symbol: symbol.baseAsset,
                name: symbol.baseAsset
            }));
            
        // Save to cache with 24 hour expiry
        saveToCache(cacheKey, symbols, CACHE_EXPIRY.SYMBOLS_DATA);
        return symbols;
    } catch (error) {
        console.error('Error fetching available symbols:', error);
        throw error;
    }
};

// Fetch current price data for a specific symbol
export const fetchCryptoData = async (symbol, interval = '1d', limit = 30) => {
    // Generate cache key for this specific data
    const cacheKey = getCacheKey.chartData(symbol, interval, limit);
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    try {
        // Make sure we append USDT if not already present
        const fullSymbol = symbol.toUpperCase().endsWith('USDT') 
            ? symbol.toUpperCase() 
            : `${symbol.toUpperCase()}USDT`;
            
        const response = await axios.get(`${BINANCE_API_BASE}/klines`, {
            params: {
                symbol: fullSymbol,
                interval: interval,
                limit: limit
            }
        });
        
        // Transform the klines data to a more usable format
        // Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
        const prices = response.data.map(kline => [kline[0], parseFloat(kline[4])]); // Use closeTime and close price
        
        const result = {
            prices: prices
        };
        
        // Cache the result with appropriate expiry time
        saveToCache(cacheKey, result, CACHE_EXPIRY.CHART_DATA);
        
        return result;
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        throw error;
    }
};

// Fetch current market data for multiple symbols
export const fetchCryptocurrencyData = async (baseCurrency = 'USDT', limit = 10) => {
    // Try cache first
    const cacheKey = getCacheKey.marketData(baseCurrency, limit);
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    try {
        // Get 24hr ticker price change statistics
        const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`);
        
        // Filter for pairs with the specified base currency (e.g., USDT)
        const filteredData = response.data
            .filter(item => item.symbol.endsWith(baseCurrency))
            .slice(0, limit)
            .map(item => ({
                id: item.symbol,
                symbol: item.symbol.replace(baseCurrency, ''),
                current_price: parseFloat(item.lastPrice),
                price_change_percentage_24h: parseFloat(item.priceChangePercent),
                total_volume: parseFloat(item.volume)
            }));
            
        // Save to cache
        saveToCache(cacheKey, filteredData, CACHE_EXPIRY.PRICE_DATA);
            
        return filteredData;
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        throw error;
    }
};

// Fetch historical klines data for a specific symbol (with pagination support)
export const fetchHistoricalData = async (symbol, interval = '1d', limit = 30, startTime = null) => {
    // Generate a unique cache key that includes the pagination parameters
    const cacheKey = getCacheKey.chartData(symbol, interval, limit) + (startTime ? `_${startTime}` : '');
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    try {
        // Make sure we append USDT if not already present
        const fullSymbol = symbol.toUpperCase().endsWith('USDT') 
            ? symbol.toUpperCase() 
            : `${symbol.toUpperCase()}USDT`;
            
        const params = {
            symbol: fullSymbol,
            interval: interval,
            limit: limit
        };
        
        // Add startTime if provided for pagination
        if (startTime) {
            params.startTime = startTime;
        }
            
        const response = await axios.get(`${BINANCE_API_BASE}/klines`, { params });
        
        // Transform the klines data
        const prices = response.data.map(kline => [kline[0], parseFloat(kline[4])]);
        
        const result = {
            prices: prices,
            // Include the last timestamp for pagination
            lastTimestamp: response.data.length ? response.data[response.data.length - 1][0] : null
        };
        
        // Cache the result
        saveToCache(cacheKey, result, CACHE_EXPIRY.CHART_DATA);
        
        return result;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
};

// Fetch global market data from CoinGecko
export const fetchGlobalMarketData = async () => {
    // Try cache first
    const cacheKey = getCacheKey.globalData();
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    try {
        const response = await axios.get(`${COINGECKO_API_BASE}/global`);
        const data = response.data.data;
        
        const result = {
            totalMarketCap: data.total_market_cap.usd || 0,
            totalVolume: data.total_volume.usd || 0,
            marketCapChange: data.market_cap_change_percentage_24h_usd || 0,
            btcDominance: data.market_cap_percentage.btc || 0,
            lastUpdated: new Date()
        };
        
        // Save to cache
        saveToCache(cacheKey, result, CACHE_EXPIRY.GLOBAL_DATA);
        
        return result;
    } catch (error) {
        console.error('Error fetching global market data:', error);
        // Return fallback data if API call fails
        return {
            totalMarketCap: 2345678901234,
            totalVolume: 123456789012,
            marketCapChange: 2.5,
            btcDominance: 45.2,
            lastUpdated: new Date()
        };
    }
};

// New function to fetch paginated list of cryptocurrencies for scrolling lists
export const fetchPaginatedCurrencies = async (page = 1, pageSize = 20, baseCurrency = 'USDT') => {
    const cacheKey = `paginated_currencies_${baseCurrency}_${page}_${pageSize}`;
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    try {
        // Get all tickers
        const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`);
        
        // Filter for pairs with the specified base currency
        const filteredData = response.data.filter(item => item.symbol.endsWith(baseCurrency));
        
        // Calculate total pages
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        
        // Get the current page of data
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = filteredData.slice(startIndex, endIndex).map(item => ({
            id: item.symbol,
            symbol: item.symbol.replace(baseCurrency, ''),
            current_price: parseFloat(item.lastPrice),
            price_change_percentage_24h: parseFloat(item.priceChangePercent),
            total_volume: parseFloat(item.volume)
        }));
        
        const result = {
            data: pageData,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                pageSize: pageSize,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
        
        // Save to cache
        saveToCache(cacheKey, result, CACHE_EXPIRY.PRICE_DATA);
        
        return result;
    } catch (error) {
        console.error('Error fetching paginated currencies:', error);
        throw error;
    }
};