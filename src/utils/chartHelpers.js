export const getChartOptions = (title) => {
    return {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title,
            },
        },
    };
};

export const transformChartData = (data) => {
    return {
        labels: data.map(item => item.timestamp),
        datasets: [
            {
                label: 'Price',
                data: data.map(item => item.price),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
            },
        ],
    };
};

// Adding this function to match what's being imported in CryptoChart.jsx
export const formatChartData = (data) => {
    // Format data from the API for chart.js
    if (!data || !data.prices) {
        return {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
            }]
        };
    }

    const timestamps = data.prices.map(item => {
        const date = new Date(item[0]);
        return date.toLocaleDateString();
    });

    const prices = data.prices.map(item => item[1]);

    return {
        labels: timestamps,
        datasets: [{
            label: 'Price',
            data: prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
        }]
    };
};