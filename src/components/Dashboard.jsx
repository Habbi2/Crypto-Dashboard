import React, { useState, useEffect, useRef, useCallback } from 'react';
import CryptoChart from './CryptoChart';
import CurrencySelector from './CurrencySelector';
import MarketOverview from './MarketOverview';
import PriceCard from './PriceCard';
import TimeframeSelector from './TimeframeSelector';
import useCryptoData from '../hooks/useCryptoData';
import { clearCache } from '../services/cacheService';

const Dashboard = ({ onPriceAlert }) => {
    const { 
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
        isFavorite,
        // New pagination features
        currentPage,
        totalPages,
        changePage,
        // WebSocket features
        isUsingWebSocket,
        toggleWebSocket,
        wsConnected,
        // Lazy loading feature
        loadChartData,
        isChartDataLoaded,
        // New method to load data for all selected currencies
        loadAllChartsData
    } = useCryptoData();
    
    // Ref to track visibility of chart section for lazy loading
    const chartRef = useRef(null);
    
    // State for pagination UI
    const [showPagination, setShowPagination] = useState(false);
    // State to store all paginated currencies
    const [allCurrencies, setAllCurrencies] = useState([]);
    const previousPricesRef = useRef({});
    
    // New state to control chart display mode
    const [showMultipleCharts, setShowMultipleCharts] = useState(false);
    
    // Load chart data when it's visible in viewport
    const handleChartVisibility = useCallback(() => {
        if (!chartRef.current) return;
        
        const rect = chartRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
            if (showMultipleCharts) {
                loadAllChartsData();
            } else if (!isChartDataLoaded) {
                loadChartData();
            }
        }
    }, [isChartDataLoaded, loadChartData, loadAllChartsData, showMultipleCharts]);
    
    // Set up intersection observer for lazy loading
    useEffect(() => {
        if (!chartRef.current) return;
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (showMultipleCharts) {
                        loadAllChartsData();
                    } else {
                        loadChartData();
                    }
                }
            },
            { threshold: 0.1 }
        );
        
        observer.observe(chartRef.current);
        
        return () => {
            if (chartRef.current) {
                observer.unobserve(chartRef.current);
            }
        };
    }, [chartRef, loadChartData, loadAllChartsData, showMultipleCharts]);
    
    // Add scroll listener as fallback for browsers without IntersectionObserver
    useEffect(() => {
        window.addEventListener('scroll', handleChartVisibility);
        window.addEventListener('resize', handleChartVisibility);
        
        // Check visibility on initial render
        handleChartVisibility();
        
        return () => {
            window.removeEventListener('scroll', handleChartVisibility);
            window.removeEventListener('resize', handleChartVisibility);
        };
    }, [handleChartVisibility]);
    
    // Effect to fetch paginated currencies when showPagination is toggled
    useEffect(() => {
        if (showPagination) {
            // Trigger pagination on first page when browse mode is activated
            changePage(1).then(result => {
                if (result && result.data) {
                    setAllCurrencies(result.data.map(item => item.symbol));
                }
            });
        }
    }, [showPagination, changePage]);
    
    // Watch for significant price changes and trigger alerts
    useEffect(() => {
        // Skip if no market data yet or no previous prices to compare
        if (!data.marketData || Object.keys(data.marketData).length === 0) return;
        
        const currentPrices = {};
        let notifications = [];
        
        // Build current prices object and check for significant changes
        Object.entries(data.marketData).forEach(([currency, currencyData]) => {
            currentPrices[currency] = currencyData.price;
            
            // Check if we have a previous price to compare
            if (previousPricesRef.current[currency]) {
                const prevPrice = previousPricesRef.current[currency];
                const currentPrice = currencyData.price;
                
                // Calculate percentage change
                const percentChange = ((currentPrice - prevPrice) / prevPrice) * 100;
                
                // Trigger notifications for significant changes (5% or more)
                if (Math.abs(percentChange) >= 5) {
                    const direction = percentChange > 0 ? 'increased' : 'decreased';
                    const type = percentChange > 0 ? 'success' : 'error';
                    
                    // Only notify if the user has selected this currency
                    if (selectedCurrencies.includes(currency)) {
                        notifications.push({
                            currency,
                            message: `${currency} has ${direction} by ${Math.abs(percentChange).toFixed(2)}% in the last update`,
                            type
                        });
                    }
                }
            }
        });
        
        // Send notifications
        notifications.forEach(note => {
            if (onPriceAlert) {
                onPriceAlert(note.currency, note.message, note.type);
            }
        });
        
        // Update previous prices reference
        previousPricesRef.current = currentPrices;
    }, [data.marketData, selectedCurrencies, onPriceAlert]);

    // Handle clearing cache
    const handleClearCache = () => {
        clearCache();
        window.location.reload();
    };
    
    // Handle pagination
    const handlePrevPage = () => {
        if (currentPage > 1) {
            changePage(currentPage - 1).then(result => {
                if (result && result.data) {
                    setAllCurrencies(result.data.map(item => item.symbol));
                }
            });
        }
    };
    
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            changePage(currentPage + 1).then(result => {
                if (result && result.data) {
                    setAllCurrencies(result.data.map(item => item.symbol));
                }
            });
        }
    };

    // Toggle between single and multiple charts display
    const toggleMultipleCharts = () => {
        setShowMultipleCharts(prev => !prev);
    };

    if (loading && Object.keys(data.marketData).length === 0) {
        return <div className="loading">Loading cryptocurrency data...</div>;
    }
    
    if (error) return <div className="error">Error fetching data: {error.message}</div>;
    
    // Determine which currencies to display based on pagination state
    const displayCurrencies = showPagination ? allCurrencies : selectedCurrencies;

    return (
        <div className="dashboard container">
            <MarketOverview globalData={data.globalData} />
            
            {/* Move Browse All Currencies button to the top and make it full width */}
            <div className="currency-pagination">
                <button onClick={() => setShowPagination(!showPagination)} className="pagination-toggle">
                    {showPagination ? 'Hide All Currencies' : 'Browse All Currencies'}
                </button>
                
                {showPagination && (
                    <div className="pagination-controls">
                        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                    </div>
                )}
                
                <button onClick={handleClearCache} className="clear-cache-btn">
                    Reset Style
                </button>
            </div>
            
            <div className="selectors-container">
                <CurrencySelector 
                    currencies={data.currencies} 
                    selectedCurrencies={selectedCurrencies} 
                    onCurrencyToggle={toggleCurrency} 
                />
                <TimeframeSelector 
                    selectedTimeframe={selectedTimeframe} 
                    onTimeframeChange={setSelectedTimeframe} 
                />
                
                {/* Add WebSocket toggle button */}
                <div className="websocket-toggle">
                    <button 
                        onClick={toggleWebSocket} 
                        className={`websocket-btn ${isUsingWebSocket ? 'active' : ''}`}
                    >
                        {isUsingWebSocket ? 'Real-time: ON' : 'Real-time: OFF'}
                        <span className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}></span>
                    </button>
                </div>

                {/* Add chart display mode toggle */}
                <div className="chart-mode-toggle">
                    <button 
                        onClick={toggleMultipleCharts} 
                        className={`chart-mode-btn ${showMultipleCharts ? 'active' : ''}`}
                    >
                        {showMultipleCharts ? 'Multiple Charts: ON' : 'Single Chart: ON'}
                    </button>
                </div>
            </div>
            
            <div className="price-cards-container">
                {showPagination ? (
                    // Show all paginated currencies with Add button
                    allCurrencies.length > 0 ? allCurrencies.map(currency => (
                        <div key={currency} className="browse-card">
                            <h3>{currency}</h3>
                            <button 
                                onClick={() => toggleCurrency(currency)}
                                className={`add-currency-btn ${selectedCurrencies.includes(currency) ? 'selected' : ''}`}
                            >
                                {selectedCurrencies.includes(currency) ? 'Added' : 'Add to Dashboard'}
                            </button>
                            <button 
                                onClick={() => toggleFavorite(currency)}
                                className={`favorite-button ${isFavorite(currency) ? 'active' : ''}`}
                            >
                                {isFavorite(currency) ? '★' : '☆'}
                            </button>
                        </div>
                    )) : (
                        <div className="no-currencies">Loading currencies...</div>
                    )
                ) : (
                    // Show selected currencies with full price data
                    selectedCurrencies.map(currency => {
                        const currencyData = data.marketData[currency] || {
                            price: 0,
                            change: 0,
                            volume: 0
                        };
                        
                        return (
                            <PriceCard 
                                key={currency}
                                currency={currency}
                                price={currencyData.price}
                                change={currencyData.change}
                                volume={currencyData.volume}
                                isActive={currency === activeCurrency}
                                onClick={setChartCurrency}
                                isFavorite={isFavorite(currency)}
                                onFavoriteToggle={toggleFavorite}
                            />
                        );
                    })
                )}
            </div>
            
            {/* Add ref for lazy loading */}
            {!showPagination && (
                <div ref={chartRef} className="crypto-chart-container">
                    {showMultipleCharts ? (
                        // Display charts for all selected currencies
                        <div className="multi-chart-view">
                            <h2>Multiple Charts View - {selectedTimeframe} Day{selectedTimeframe !== '1' ? 's' : ''}</h2>
                            
                            {!data.multiChartData && (
                                <div className="chart-loading">
                                    <button onClick={loadAllChartsData} className="load-chart-btn">
                                        Load All Charts
                                    </button>
                                </div>
                            )}
                            
                            {data.multiChartData && selectedCurrencies.map(currency => (
                                <div key={currency} className="individual-chart">
                                    <CryptoChart 
                                        data={data.multiChartData[currency] || []} 
                                        selectedCurrency={currency} 
                                        selectedTimeframe={selectedTimeframe} 
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Display single chart for active currency
                        <div className="single-chart-view">
                            {!isChartDataLoaded && activeCurrency && (
                                <div className="chart-loading">
                                    <button onClick={loadChartData} className="load-chart-btn">
                                        Load {activeCurrency} Chart
                                    </button>
                                </div>
                            )}
                            
                            {isChartDataLoaded && (
                                <CryptoChart 
                                    data={data.prices} 
                                    selectedCurrency={activeCurrency} 
                                    selectedTimeframe={selectedTimeframe} 
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;