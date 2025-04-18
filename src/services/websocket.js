// WebSocket service for real-time cryptocurrency data
import { Subject } from 'rxjs';

// Create subjects for different data types
const priceUpdateSubject = new Subject();
const connectionStatusSubject = new Subject();

// Track subscription states
let socket = null;
let subscribedSymbols = [];
let isConnected = false;
let reconnectTimeout = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Connect to Binance WebSocket
export const connectWebSocket = () => {
  if (socket !== null) {
    return;
  }

  try {
    // Connect to Binance WebSocket for ticker streams
    socket = new WebSocket('wss://stream.binance.com:9443/ws');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      isConnected = true;
      reconnectAttempts = 0;
      connectionStatusSubject.next(true);
      
      // Subscribe to previously subscribed symbols
      if (subscribedSymbols.length > 0) {
        subscribeToSymbols(subscribedSymbols);
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different types of messages
        if (data.e === '24hrTicker') {
          const symbolData = {
            symbol: data.s.replace('USDT', ''),
            price: parseFloat(data.c),
            priceChange: parseFloat(data.p),
            priceChangePercent: parseFloat(data.P),
            volume: parseFloat(data.v),
            quoteVolume: parseFloat(data.q),
            timestamp: data.E
          };
          
          priceUpdateSubject.next(symbolData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.reason);
      isConnected = false;
      connectionStatusSubject.next(false);
      
      // Attempt to reconnect if not explicitly closed by the user
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimeout = setTimeout(() => {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          connectWebSocket();
        }, 5000 * reconnectAttempts); // Exponential backoff
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      connectionStatusSubject.next(false);
    };
  } catch (error) {
    console.error('Failed to establish WebSocket connection:', error);
    connectionStatusSubject.next(false);
  }
};

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  if (socket !== null) {
    socket.close();
    socket = null;
  }
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  subscribedSymbols = [];
  isConnected = false;
};

// Subscribe to symbols
export const subscribeToSymbols = (symbols) => {
  if (!isConnected || !socket) {
    subscribedSymbols = symbols;
    connectWebSocket();
    return;
  }
  
  const uniqueSymbols = [...new Set(symbols)];
  subscribedSymbols = uniqueSymbols;
  
  // Format symbols for Binance (append USDT)
  const formattedSymbols = uniqueSymbols.map(symbol => 
    symbol.toUpperCase().endsWith('USDT') ? symbol.toLowerCase() : `${symbol.toLowerCase()}usdt`
  );
  
  // Create subscription message
  const subscriptionMsg = {
    method: 'SUBSCRIBE',
    params: formattedSymbols.map(symbol => `${symbol}@ticker`),
    id: new Date().getTime()
  };
  
  socket.send(JSON.stringify(subscriptionMsg));
};

// Unsubscribe from symbols
export const unsubscribeFromSymbols = (symbols) => {
  if (!isConnected || !socket) {
    return;
  }
  
  const formattedSymbols = symbols.map(symbol => 
    symbol.toUpperCase().endsWith('USDT') ? symbol.toLowerCase() : `${symbol.toLowerCase()}usdt`
  );
  
  const unsubscriptionMsg = {
    method: 'UNSUBSCRIBE',
    params: formattedSymbols.map(symbol => `${symbol}@ticker`),
    id: new Date().getTime()
  };
  
  socket.send(JSON.stringify(unsubscriptionMsg));
  
  // Update subscribed symbols list
  subscribedSymbols = subscribedSymbols.filter(symbol => !symbols.includes(symbol));
};

// Observables for components to subscribe to
export const priceUpdates$ = priceUpdateSubject.asObservable();
export const connectionStatus$ = connectionStatusSubject.asObservable();