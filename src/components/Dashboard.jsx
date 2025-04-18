import React, { useState, useEffect, useRef } from 'react';
import CryptoChart from './CryptoChart';
import CurrencySelector from './CurrencySelector';
import MarketOverview from './MarketOverview';
import PriceCard from './PriceCard';
import TimeframeSelector from './TimeframeSelector';
import useCryptoData from '../hooks/useCryptoData';

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
        isFavorite
    } = useCryptoData();
    
    // Removed showOnlyFavorites state since we're removing the filter button
    const previousPricesRef = useRef({});
    
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

    if (loading) return <div className="loading">Loading cryptocurrency data...</div>;
    if (error) return <div className="error">Error fetching data: {error.message}</div>;
    
    // Display all selected currencies - removed filtering by favorites
    const displayCurrencies = selectedCurrencies;

    return (
        <div className="dashboard container">
            <MarketOverview globalData={data.globalData} />
            
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
            </div>
            
            {/* Favorites filter button removed */}
            
            <div className="price-cards-container">
                {displayCurrencies.map(currency => {
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
                })}
            </div>
            
            <CryptoChart 
                data={data.prices} 
                selectedCurrency={activeCurrency} 
                selectedTimeframe={selectedTimeframe} 
            />
        </div>
    );
};

export default Dashboard;