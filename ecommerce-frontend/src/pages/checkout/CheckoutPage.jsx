import { api } from '../../utils/api';
import { useState, useEffect } from 'react';
import { OrderSummary } from './OrderSummary';
import { PaymentSummary } from './PaymentSummary';
import { Link } from 'react-router-dom';
import './checkout-header.css';
import './CheckoutPage.css';

export function CheckoutPage({ cart, loadCart }) {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const totalItems = cart?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  useEffect(() => {
    const fetchCheckoutData = async () => {
      let response = await api.get(
        '/api/delivery-options?expand=estimatedDeliveryTime'
      );
      setDeliveryOptions(response.data);

      response = await api.get('/api/payment-summary');
      setPaymentSummary(response.data);
    };

    fetchCheckoutData();
  }, [cart]);

  return (
    <>
      <title>Checkout</title>

      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            
            
            <Link className="logo-link header-link" to="/">

          <span className="logo">LIORA STORE</span>
        </Link>
            
          </div>

          <div className="checkout-header-middle-section">
            Checkout (<Link className="return-to-home-link"
              to="/">{totalItems} {totalItems === 1 ? 'item' : 'items'}</Link>)
          </div>

          <div className="checkout-header-right-section">
            <img src="images/icons/checkout-lock-icon.png" />
          </div>
        </div>
      </div>

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <OrderSummary cart={cart} deliveryOptions={deliveryOptions}
            loadCart={loadCart} />

          <PaymentSummary paymentSummary={paymentSummary} loadCart={loadCart} />
        </div>
      </div>
    </>
  );
}