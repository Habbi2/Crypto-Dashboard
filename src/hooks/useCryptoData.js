import { useState, useEffect } from 'react';
import { 
    fetchCryptoData, 
    fetchCryptocurrencyData, 
    fetchAvailableSymbols, 
    fetchGlobalMarketData 
} from '../services/api';

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
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCurrencies, setSelectedCurrencies] = useState(['BTC']); // Default to Bitcoin
    const [selectedTimeframe, setSelectedTimeframe] = useState('7'); // Default timeframe in days
    const [activeCurrency, setActiveCurrency] = useState('BTC'); // For chart display
    const [favorites, setFavorites] = useState(
        JSON.parse(localStorage.getItem('cryptoFavorites')) || []
    );
    
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
                return prev.length > 1 ? prev.filter(c => c !== currency) : prev;
            } else {
                return [...prev, currency];
            }
        });
    };

    // Set which currency is active for the chart display
    const setChartCurrency = (currency) => {
        if (selectedCurrencies.includes(currency)) {
            setActiveCurrency(currency);
        }
    };
    
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

    useEffect(() => {
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
        
        return () => clearInterval(globalDataInterval);
    }, []);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                const { interval, limit } = getIntervalAndLimit(selectedTimeframe);
                
                // Fetch price chart data for the active currency
                const chartData = await fetchCryptoData(activeCurrency, interval, limit);
                
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
                    prices: chartData.prices || [],
                    marketData: marketDataMap
                }));
            } catch (err) {
                console.error("Error in useCryptoData:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedCurrencies.length > 0) {
            getData();
        }
    }, [selectedCurrencies, selectedTimeframe, activeCurrency]);

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
        isFavorite: (currency) => favorites.includes(currency)
    };
};

export default useCryptoData;