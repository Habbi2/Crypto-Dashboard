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
3. **Important**: This project requires Node.js v16 for compatibility:
   * Windows users: Install Node.js v16 from [nodejs.org](https://nodejs.org/download/release/latest-v16.x/)
   * Users with nvm: Run `nvm use` to automatically use the correct version
4. Install dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm start
   ```

## Node.js Version Compatibility
This project is optimized for Node.js v16. Using newer versions (like v22+) may cause build failures with 
"unsupported digital envelope routines" errors due to changes in OpenSSL implementations.

If you must use a newer Node.js version:
* Ensure the `NODE_OPTIONS=--openssl-legacy-provider` flag is used (already configured in package.json scripts)
* On Windows, you may need to use `set NODE_OPTIONS=--openssl-legacy-provider && react-scripts build`
* On Linux/Mac, use `export NODE_OPTIONS=--openssl-legacy-provider && react-scripts build`

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