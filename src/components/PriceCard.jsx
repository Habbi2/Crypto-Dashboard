import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const PriceCard = ({ 
    currency, 
    price, 
    change, 
    volume, 
    isActive, 
    onClick, 
    isFavorite, 
    hasAlert,
    onFavoriteToggle 
}) => {
    // Determine styling classes based on price change
    const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
    const changeIcon = change >= 0 ? '↑' : '↓';
    
    // Handle favorite toggle without triggering the card click
    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Prevent card click
        onFavoriteToggle(currency);
    };
    
    return (
        <div 
            className={`price-card ${isActive ? 'active' : ''}`}
            onClick={() => onClick(currency)}
        >
            <div className="price-card-header">
                <h2>{currency}/USDT</h2>
                <div className="price-card-actions">
                    {hasAlert && (
                        <span className="alert-indicator" title="Price alert active">⚠️</span>
                    )}
                    <button 
                        className={`favorite-button ${isFavorite ? 'active' : ''}`}
                        onClick={handleFavoriteClick}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
            
            <p>
                <span className="label">Current Price:</span>
                <span className="price-value">{formatCurrency(price)}</span>
            </p>
            
            <p>
                <span className="label">24h Change:</span>
                <span className={changeClass}>
                    {changeIcon} {formatPercentage(change)}
                </span>
            </p>
            
            <p>
                <span className="label">24h Volume:</span>
                <span>{formatCurrency(volume)}</span>
            </p>
            
            {isActive && <div className="active-indicator">Active</div>}
        </div>
    );
};

export default PriceCard;