import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatChartData } from '../utils/chartHelpers';

// Register Chart.js components including Filler for area charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CryptoChart = ({ data, selectedCurrency, selectedTimeframe }) => {
    // Get timeframe label for display
    const getTimeframeLabel = () => {
        switch(selectedTimeframe) {
            case '1': return 'Last 24 Hours';
            case '7': return 'Last 7 Days';
            case '30': return 'Last Month';
            case '365': return 'Last Year';
            case 'max': return 'All Time';
            default: return '';
        }
    };
    
    // Format the data for the chart
    const chartData = formatChartData({ prices: data });
    
    // Enhanced chart options for better visual appeal
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    color: '#212529'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                titleColor: '#212529',
                bodyColor: '#212529',
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 13
                },
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    maxRotation: 0,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#6c757d'
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#6c757d',
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };
    
    // Update dataset styling for better visuals
    if (chartData && chartData.datasets && chartData.datasets.length > 0) {
        chartData.datasets[0] = {
            ...chartData.datasets[0],
            label: `${selectedCurrency} Price`,
            borderColor: '#3a86ff',
            backgroundColor: 'rgba(58, 134, 255, 0.1)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#3a86ff',
            pointBorderColor: '#ffffff',
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#3a86ff',
            tension: 0.4,
            fill: true
        };
    }
    
    if (!data || data.length === 0) {
        return <div className="crypto-chart">No chart data available</div>;
    }

    return (
        <div className="crypto-chart">
            <h2>{selectedCurrency}/USDT - {getTimeframeLabel()}</h2>
            <div style={{ height: '400px', position: 'relative' }}>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default CryptoChart;