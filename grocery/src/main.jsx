import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AuthProvider } from './context/AuthContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { InventoryProvider } from './context/InventoryContext';
import ToastProvider from './Components/SuccessAlert/SuccessAlert';

const rawPaypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PLACEHOLDER_PAYPAL_CLIENT_ID = 'your_paypal_sandbox_client_id_here';

const paypalClientId =
  !rawPaypalClientId || rawPaypalClientId === PLACEHOLDER_PAYPAL_CLIENT_ID
    ? 'test'
    : rawPaypalClientId;

const initialOptions = {
  'client-id': paypalClientId, 
  currency: 'USD',
  intent: 'capture',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PayPalScriptProvider options={initialOptions}>
      <AuthProvider>
        <ReviewsProvider>
            <InventoryProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </InventoryProvider>
          </ReviewsProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  </React.StrictMode>,
)
