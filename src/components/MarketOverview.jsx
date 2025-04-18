import React from 'react';

const MarketOverview = ({ globalData }) => {
    const {
        totalMarketCap,
        totalVolume,
        btcDominance,
        marketCapChange
    } = globalData;

    // Format the timestamp
    const formattedTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className="market-overview">
            <div className="market-overview-header">
                <h3>Market Overview</h3>
                <div className="last-updated">
                    <span className="update-label">LAST UPDATED</span>
                    <span className="update-time">{formattedTime}</span>
                </div>
            </div>
            
            <div className="market-stats-inline">
                <div className="stat-inline market-cap">
                    <div className="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-title">Total Market Cap</div>
                        <div className="stat-value">${totalMarketCap.toLocaleString()}</div>
                        <div className={`stat-change ${marketCapChange >= 0 ? 'positive' : 'negative'}`}>
                            {marketCapChange >= 0 ? '↑' : '↓'} {Math.abs(marketCapChange).toFixed(2)}%
                        </div>
                    </div>
                </div>

                <div className="stat-inline volume">
                    <div className="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-title">24h Volume</div>
                        <div className="stat-value">${totalVolume.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-inline btc-dominance">
                    <div className="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a8 8 0 1 0 0 16 8 8 0 1 0 0-16z"></path>
                            <path d="M15.65 9.35a3.5 3.5 0 0 1-6.3 0"></path>
                            <path d="M17 5c0 2-2 3-2 3"></path>
                            <path d="M9 5c0 2-2 3-2 3"></path>
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-title">BTC Dominance</div>
                        <div className="stat-value">{btcDominance.toFixed(1)}%</div>
                        <div className="stat-progress">
                            <div className="progress-bar" style={{ width: `${btcDominance}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketOverview;