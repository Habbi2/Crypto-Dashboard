import React from 'react';

const TimeframeSelector = ({ selectedTimeframe, onTimeframeChange }) => {
    // Define timeframes with their display labels and API values
    // Values match the days parameters used in useCryptoData
    const timeframes = [
        { label: '24H', value: '1' },
        { label: '7D', value: '7' },
        { label: '1M', value: '30' },
        { label: '1Y', value: '365' },
        { label: 'ALL', value: 'max' }
    ];

    return (
        <div className="timeframe-selector">
            <h3>Timeframe</h3>
            <ul>
                {timeframes.map((timeframe) => (
                    <li 
                        key={timeframe.label} 
                        className={selectedTimeframe === timeframe.value ? 'active' : ''}
                    >
                        <button onClick={() => onTimeframeChange(timeframe.value)}>
                            {timeframe.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TimeframeSelector;