# Crypto Dashboard

## Overview
The Crypto Dashboard is an interactive web application that visualizes cryptocurrency data using a public API. Users can select different cryptocurrencies and timeframes to view real-time data represented through charts and cards.

## Features
- Interactive charts displaying cryptocurrency prices over selected timeframes.
- Currency selector to choose different cryptocurrencies.
- Price cards showing current prices and relevant information.
- Responsive design for optimal viewing on various devices.

## Technologies Used
- React: A JavaScript library for building user interfaces.
- Charting Library: For visualizing cryptocurrency data.
- CSS: For styling the application.
- Axios: For making API requests.

## Project Structure
```
crypto-dashboard
├── src
│   ├── assets
│   │   └── styles
│   │       └── main.css
│   ├── components
│   │   ├── App.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CryptoChart.jsx
│   │   ├── CurrencySelector.jsx
│   │   ├── PriceCard.jsx
│   │   └── TimeframeSelector.jsx
│   ├── services
│   │   └── api.js
│   ├── utils
│   │   ├── formatters.js
│   │   └── chartHelpers.js
│   ├── hooks
│   │   └── useCryptoData.js
│   └── index.js
├── public
│   ├── index.html
│   └── robots.txt
├── netlify.toml
├── package.json
├── .gitignore
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd crypto-dashboard
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

## Deployment
This project is configured for deployment on Netlify. Ensure that the `netlify.toml` file is correctly set up with the necessary build settings.

## Usage
Once the application is running, users can:
- Select a cryptocurrency from the dropdown menu.
- Choose a timeframe for the data visualization.
- View the current price and historical data in chart format.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.