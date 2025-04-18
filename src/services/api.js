import axios from 'axios';

// Binance API endpoints
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
// CoinGecko API for global market data
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Fetch list of available coins/symbols from Binance
export const fetchAvailableSymbols = async () => {
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
        return symbols;
    } catch (error) {
        console.error('Error fetching available symbols:', error);
        throw error;
    }
};

// Fetch current price data for a specific symbol
export const fetchCryptoData = async (symbol, interval = '1d', limit = 30) => {
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
        
        return {
            prices: prices
        };
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        throw error;
    }
};

// Fetch current market data for multiple symbols
export const fetchCryptocurrencyData = async (baseCurrency = 'USDT', limit = 10) => {
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
            
        return filteredData;
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        throw error;
    }
};

// Fetch historical klines data for a specific symbol
export const fetchHistoricalData = async (symbol, interval = '1d', limit = 30) => {
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
        
        // Transform the klines data
        const prices = response.data.map(kline => [kline[0], parseFloat(kline[4])]);
        
        return {
            prices: prices
        };
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
};

// Fetch global market data from CoinGecko
export const fetchGlobalMarketData = async () => {
    try {
        const response = await axios.get(`${COINGECKO_API_BASE}/global`);
        const data = response.data.data;
        
        return {
            totalMarketCap: data.total_market_cap.usd || 0,
            totalVolume: data.total_volume.usd || 0,
            marketCapChange: data.market_cap_change_percentage_24h_usd || 0,
            btcDominance: data.market_cap_percentage.btc || 0,
            lastUpdated: new Date()
        };
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