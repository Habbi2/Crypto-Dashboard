import React, { useState, useMemo, useEffect } from 'react';
import SearchBar from './SearchBar';

const CurrencySelector = ({ currencies, selectedCurrencies, onCurrencyToggle }) => {
    const [searchQuery, setSearchQuery] = useState('');
    // Track previously selected currencies so they remain visible after deselection
    const [previouslySelected, setPreviouslySelected] = useState([]);
    
    // Popular cryptocurrencies to show by default
    const popularCurrencies = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC'];
    
    // Update the previously selected when selectedCurrencies changes
    useEffect(() => {
        setPreviouslySelected(prev => [...new Set([...prev, ...selectedCurrencies])]);
    }, [selectedCurrencies]);
    
    // Filter the available currencies based on search query
    const filteredCurrencies = useMemo(() => {
        if (!currencies || currencies.length === 0) return ['BTC'];
        
        if (!searchQuery) {
            // Make sure we always show selected currencies, previously selected, and popular ones
            return [...new Set([
                ...selectedCurrencies,
                ...previouslySelected,
                ...currencies.filter(currency => popularCurrencies.includes(currency))
            ])];
        }
        
        // Otherwise filter based on search query (case insensitive)
        // But still make sure selected currencies are always included
        const searchResults = currencies.filter(currency => 
            currency.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 20); // Limit to 20 results for performance
        
        // Ensure selected currencies and previously selected are included in results
        const selectedInSearch = [...selectedCurrencies, ...previouslySelected].filter(currency => 
            currency.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return [...new Set([...selectedInSearch, ...searchResults])].slice(0, 20);
    }, [currencies, searchQuery, selectedCurrencies, previouslySelected]);

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
                    <small>Showing popular coins and selected currencies</small>
                )}
            </div>
        </div>
    );
};

export default CurrencySelector;