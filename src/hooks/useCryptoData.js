import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    fetchCryptoData, 
    fetchCryptocurrencyData, 
    fetchAvailableSymbols, 
    fetchGlobalMarketData,
    fetchPaginatedCurrencies
} from '../services/api';
import {
    connectWebSocket,
    disconnectWebSocket,
    subscribeToSymbols,
    unsubscribeFromSymbols,
    priceUpdates$,
    connectionStatus$
} from '../services/websocket';
import { clearExpiredCache } from '../services/cacheService';

const useCryptoData = () => {
    // Initialize with default structure to prevent undefined access errors
    const [data, setData] = useState({
        prices: [],
        currencies: [], // Will be populated with available cryptocurrencies from Binance
        marketData: {},  // Will hold data for multiple currencies
        globalData: {
            totalMarketCap: 0,
            totalVolume: 0,
            btcDominance: 0,
            marketCapChange: 0
        },
        multiChartData: null // New field to store data for multiple charts
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCurrencies, setSelectedCurrencies] = useState(['BTC']); // Default to Bitcoin
    const [selectedTimeframe, setSelectedTimeframe] = useState('7'); // Default timeframe in days
    const [activeCurrency, setActiveCurrency] = useState('BTC'); // For chart display
    const [favorites, setFavorites] = useState(
        JSON.parse(localStorage.getItem('cryptoFavorites')) || []
    );
    const [isUsingWebSocket, setIsUsingWebSocket] = useState(true); // Default to using WebSocket
    const [wsConnected, setWsConnected] = useState(false);
    
    // For pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    
    // For lazy loading
    const [isChartDataLoaded, setIsChartDataLoaded] = useState(false);
    const [isMultiChartDataLoaded, setIsMultiChartDataLoaded] = useState(false);
    const wsSubscriptionRef = useRef(null);
    
    // Map timeframe days to Binance kline interval
    const getIntervalAndLimit = (days) => {
        switch(days) {
            case '1': return { interval: '1h', limit: 24 };
            case '7': return { interval: '4h', limit: 42 };
            case '30': return { interval: '1d', limit: 30 };
            case '365': return { interval: '1w', limit: 52 };
            case 'max': return { interval: '1M', limit: 60 };
            default: return { interval: '1d', limit: 30 };
        }
    };

    // Toggle currencies in the selected list
    const toggleCurrency = (currency) => {
        setSelectedCurrencies(prev => {
            if (prev.includes(currency)) {
                // If removing the active currency, set a new active currency
                if (currency === activeCurrency && prev.length > 1) {
                    const newActive = prev.find(c => c !== currency) || 'BTC';
                    setActiveCurrency(newActive);
                }
                
                // Don't allow removing the last currency
                const newSelected = prev.length > 1 ? prev.filter(c => c !== currency) : prev;
                
                // Update WebSocket subscriptions
                if (isUsingWebSocket) {
                    unsubscribeFromSymbols([currency]);
                }
                
                // Reset multi-chart data when removing a currency
                setIsMultiChartDataLoaded(false);
                
                return newSelected;
            } else {
                const newSelected = [...prev, currency];
                
                // Update WebSocket subscriptions
                if (isUsingWebSocket) {
                    subscribeToSymbols([currency]);
                }
                
                // Reset multi-chart data when adding a currency
                setIsMultiChartDataLoaded(false);
                
                return newSelected;
            }
        });
    };

    // Set which currency is active for the chart display
    const setChartCurrency = useCallback((currency) => {
        if (selectedCurrencies.includes(currency)) {
            setActiveCurrency(currency);
            setIsChartDataLoaded(false); // Reset chart loaded state to trigger lazy loading
        }
    }, [selectedCurrencies]);
    
    // Toggle currency in favorites
    const toggleFavorite = (currency) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(currency) 
                ? prev.filter(c => c !== currency)
                : [...prev, currency];
                
            // Save to localStorage
            localStorage.setItem('cryptoFavorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };
    
    // Change page for pagination
    const changePage = useCallback(async (page) => {
        if (page < 1 || page > totalPages) return null;
        
        setLoading(true);
        try {
            const result = await fetchPaginatedCurrencies(page, pageSize, 'USDT');
            setData(prevData => ({
                ...prevData,
                currencies: result.data.map(item => item.symbol)
            }));
            
            setCurrentPage(page);
            setTotalPages(result.pagination.totalPages);
            return result; // Return the result so it can be used by the caller
        } catch (err) {
            console.error("Error changing page:", err);
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [totalPages, pageSize]);
    
    // Toggle WebSocket usage
    const toggleWebSocket = useCallback(() => {
        setIsUsingWebSocket(prev => {
            if (prev) {
                // Turning off WebSocket
                disconnectWebSocket();
                return false;
            } else {
                // Turning on WebSocket
                connectWebSocket();
                // Subscribe to all selected currencies
                subscribeToSymbols(selectedCurrencies);
                return true;
            }
        });
    }, [selectedCurrencies]);
    
    // Load chart data for a single currency on demand (lazy loading)
    const loadChartData = useCallback(async () => {
        if (isChartDataLoaded) return;
        
        setLoading(true);
        try {
            const { interval, limit } = getIntervalAndLimit(selectedTimeframe);
            const chartData = await fetchCryptoData(activeCurrency, interval, limit);
            
            setData(prevData => ({
                ...prevData,
                prices: chartData.prices || []
            }));
            setIsChartDataLoaded(true);
        } catch (err) {
            console.error("Error loading chart data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [activeCurrency, selectedTimeframe, isChartDataLoaded]);

    // New function to load chart data for all selected currencies
    const loadAllChartsData = useCallback(async () => {
        if (isMultiChartDataLoaded && data.multiChartData) return;
        
        setLoading(true);
        try {
            const { interval, limit } = getIntervalAndLimit(selectedTimeframe);
            const multiData = {};
            
            // Fetch data for all selected currencies in parallel
            const promises = selectedCurrencies.map(async (currency) => {
                const chartData = await fetchCryptoData(currency, interval, limit);
                return { currency, data: chartData.prices || [] };
            });
            
            const results = await Promise.all(promises);
            
            // Convert results to an object with currency keys
            results.forEach(({ currency, data }) => {
                multiData[currency] = data;
            });
            
            setData(prevData => ({
                ...prevData,
                multiChartData: multiData
            }));
            setIsMultiChartDataLoaded(true);
        } catch (err) {
            console.error("Error loading multiple chart data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [selectedCurrencies, selectedTimeframe, isMultiChartDataLoaded, data.multiChartData]);

    // Initial setup - fetch symbols and set up WebSocket
    useEffect(() => {
        // Clear expired cache on component mount
        clearExpiredCache();
        
        // Fetch all available crypto symbols when the component first loads
        const fetchSymbols = async () => {
            try {
                const symbols = await fetchAvailableSymbols();
                setData(prevData => ({
                    ...prevData,
                    currencies: symbols.map(s => s.symbol)
                }));
            } catch (err) {
                console.error("Error fetching available symbols:", err);
                setError(err);
            }
        };
        
        fetchSymbols();
        
        // Fetch global market data on initial load
        const fetchGlobalData = async () => {
            try {
                const globalData = await fetchGlobalMarketData();
                setData(prevData => ({
                    ...prevData,
                    globalData
                }));
            } catch (err) {
                console.error("Error fetching global market data:", err);
            }
        };
        
        fetchGlobalData();
        
        // Set up interval to refresh global data every 5 minutes
        const globalDataInterval = setInterval(fetchGlobalData, 5 * 60 * 1000);
        
        // Initialize WebSocket connection
        if (isUsingWebSocket) {
            connectWebSocket();
        }
        
        // Subscribe to WebSocket connection status
        const connectionStatusSubscription = connectionStatus$.subscribe(isConnected => {
            setWsConnected(isConnected);
        });
        
        return () => {
            clearInterval(globalDataInterval);
            connectionStatusSubscription.unsubscribe();
            disconnectWebSocket();
        };
    }, []);

    // Subscribe to selected currencies in WebSocket
    useEffect(() => {
        if (isUsingWebSocket && selectedCurrencies.length > 0) {
            subscribeToSymbols(selectedCurrencies);
        }
    }, [isUsingWebSocket, selectedCurrencies]);

    // Fetch market data for selected currencies
    useEffect(() => {
        const getMarketData = async () => {
            setLoading(true);
            try {
                // Fetch current market data for all currencies
                const marketDataList = await fetchCryptocurrencyData('USDT', 50);
                
                // Create a mapped object of market data keyed by currency
                const marketDataMap = {};
                
                // Filter to only include selected currencies and format the data
                selectedCurrencies.forEach(currency => {
                    const currencyData = marketDataList.find(item => item.symbol === currency);
                    
                    if (currencyData) {
                        marketDataMap[currency] = {
                            price: currencyData.current_price || 0,
                            change: currencyData.price_change_percentage_24h || 0,
                            volume: currencyData.total_volume || 0
                        };
                    }
                });
                
                // Transform data into the format our components expect
                setData(prevData => ({
                    ...prevData,
                    marketData: marketDataMap
                }));
            } catch (err) {
                console.error("Error fetching market data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedCurrencies.length > 0) {
            getMarketData();
        }
    }, [selectedCurrencies]);

    // Subscribe to real-time price updates via WebSocket
    useEffect(() => {
        if (!isUsingWebSocket) return;
        
        // Unsubscribe from previous subscription if it exists
        if (wsSubscriptionRef.current) {
            wsSubscriptionRef.current.unsubscribe();
        }
        
        // Subscribe to price updates
        const subscription = priceUpdates$.subscribe(update => {
            // Only update if it's a currency we're currently tracking
            if (selectedCurrencies.includes(update.symbol)) {
                setData(prevData => {
                    const updatedMarketData = { ...prevData.marketData };
                    
                    // Update or add the currency data
                    updatedMarketData[update.symbol] = {
                        price: update.price,
                        change: update.priceChangePercent,
                        volume: update.volume
                    };
                    
                    return {
                        ...prevData,
                        marketData: updatedMarketData
                    };
                });
            }
        });
        
        wsSubscriptionRef.current = subscription;
        
        return () => {
            if (wsSubscriptionRef.current) {
                wsSubscriptionRef.current.unsubscribe();
            }
        };
    }, [isUsingWebSocket, selectedCurrencies]);

    // Reset chart data when timeframe changes
    useEffect(() => {
        setIsChartDataLoaded(false);
        setIsMultiChartDataLoaded(false);
        
        // Reset multi-chart data in state when timeframe changes
        setData(prevData => ({
            ...prevData,
            multiChartData: null
        }));
    }, [selectedTimeframe]);
    
    // Reset single chart data when active currency changes
    useEffect(() => {
        setIsChartDataLoaded(false);
    }, [activeCurrency]);

    return { 
        data, 
        loading, 
        error, 
        selectedCurrencies,
        toggleCurrency,
        activeCurrency,
        setChartCurrency,
        selectedTimeframe, 
        setSelectedTimeframe,
        favorites,
        toggleFavorite,
        isFavorite: (currency) => favorites.includes(currency),
        // Pagination
        currentPage,
        pageSize,
        totalPages,
        changePage,
        // WebSocket
        isUsingWebSocket,
        toggleWebSocket,
        wsConnected,
        // Lazy loading
        loadChartData,
        isChartDataLoaded,
        // Multiple charts
        loadAllChartsData,
        isMultiChartDataLoaded
    };
};

export default useCryptoData;