import React, { useState, useMemo } from 'react';
import SearchBar from './SearchBar';

const CurrencySelector = ({ currencies, selectedCurrencies, onCurrencyToggle }) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Popular cryptocurrencies to show by default
    const popularCurrencies = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC'];
    
    // Filter the available currencies based on search query
    const filteredCurrencies = useMemo(() => {
        if (!currencies || currencies.length === 0) return ['BTC'];
        
        if (!searchQuery) {
            // Just show popular currencies if no search query
            return currencies.filter(currency => popularCurrencies.includes(currency));
        }
        
        // Otherwise filter based on search query (case insensitive)
        return currencies.filter(currency => 
            currency.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 20); // Limit to 20 results for performance
    }, [currencies, searchQuery]);

    return (
        <div className="currency-selector">
            <h3>Select Cryptocurrencies</h3>
            
            <SearchBar onSearch={setSearchQuery} />
            
            <div className="currency-buttons">
                {filteredCurrencies.map((currency) => (
                    <button
                        key={currency}
                        className={`currency-button ${selectedCurrencies.includes(currency) ? 'selected' : ''}`}
                        onClick={() => onCurrencyToggle(currency)}
                    >
                        {currency}
                    </button>
                ))}
            </div>
            
            <div className="selector-info">
                {searchQuery ? (
                    <small>Showing {filteredCurrencies.length} results for "{searchQuery}"</small>
                ) : (
                    <small>Showing popular coins from Binance</small>
                )}
            </div>
        </div>
    );
};

export default CurrencySelector;