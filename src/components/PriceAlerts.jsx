import React, { useState } from 'react';

const PriceAlerts = ({ currencies, marketData, onSetAlert, userAlerts = [] }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [alertType, setAlertType] = useState('above'); // 'above' or 'below'
  const [alertPrice, setAlertPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCurrency) {
      setError('Please select a currency');
      return;
    }
    
    if (!alertPrice || isNaN(alertPrice) || Number(alertPrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    setError('');

    // Create the alert object
    const newAlert = {
      id: Date.now(),
      currency: selectedCurrency,
      type: alertType,
      price: Number(alertPrice),
      createdAt: new Date(),
      triggered: false
    };
    
    onSetAlert(newAlert);
    
    // Reset form
    setSelectedCurrency('');
    setAlertPrice('');
  };

  // Get current price of selected currency to show as reference
  const currentPrice = selectedCurrency && marketData[selectedCurrency] 
    ? marketData[selectedCurrency].price 
    : null;

  return (
    <div className="price-alerts">
      <h3>Set Price Alerts</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="alertCurrency">Currency</label>
            <select 
              id="alertCurrency"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="form-control"
            >
              <option value="">Select currency</option>
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="alertType">Alert when price is</label>
            <select
              id="alertType"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="form-control"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="alertPrice">Price (USD)</label>
            <input
              id="alertPrice"
              type="number"
              min="0"
              step="0.01"
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              className="form-control"
              placeholder={currentPrice ? `Current: $${currentPrice.toFixed(2)}` : 'Enter price'}
            />
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}
        
        {currentPrice && (
          <div className="current-price-ref">
            Current price: ${currentPrice.toFixed(2)}
          </div>
        )}
        
        <button type="submit" className="alert-button">Set Alert</button>
      </form>
      
      {userAlerts.length > 0 && (
        <div className="user-alerts">
          <h4>Your Alerts</h4>
          <ul className="alerts-list">
            {userAlerts.map(alert => (
              <li key={alert.id} className={`alert-item ${alert.triggered ? 'triggered' : ''}`}>
                <span className="alert-currency">{alert.currency}</span>
                <span className="alert-details">
                  Price {alert.type === 'above' ? 'above' : 'below'} ${alert.price.toFixed(2)}
                </span>
                <button 
                  className="delete-alert" 
                  onClick={() => onSetAlert(null, alert.id)}
                  aria-label="Delete alert"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;