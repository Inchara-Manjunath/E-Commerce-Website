import dayjs from 'dayjs';
import axios from 'axios';
import { useState } from 'react';
import { formatMoney } from '../../utils/money';
import { DeliveryOptions } from './DeliveryOptions';

export function OrderSummary({ cart, deliveryOptions, loadCart }) {
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);

  const updateQuantity = async (productId) => {
    if (newQuantity < 1 || newQuantity > 10) {
      alert('Quantity must be between 1 and 10');
      return;
    }

    await axios.put(`/api/cart-items/${productId}`, {
      quantity: newQuantity
    });
    await loadCart();
    setEditingQuantity(null);
  };

  const startEditing = (cartItem) => {
    setEditingQuantity(cartItem.productId);
    setNewQuantity(cartItem.quantity);
  };

  const cancelEditing = () => {
    setEditingQuantity(null);
  };

  return (
    <div className="order-summary">
      {deliveryOptions.length > 0 && cart.map((cartItem) => {
        const selectedDeliveryOption = deliveryOptions
          .find((deliveryOption) => {
            return deliveryOption.id === cartItem.deliveryOptionId;
          });

        const deleteCartItem = async () => {
          await axios.delete(`/api/cart-items/${cartItem.productId}`);
          await loadCart();
        };

        return (
          <div key={cartItem.productId} className="cart-item-container">
            <div className="delivery-date">
              Delivery date: {dayjs(selectedDeliveryOption.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
            </div>

            <div className="cart-item-details-grid">
              <img className="product-image"
                src={cartItem.product.image} />

              <div className="cart-item-details">
                <div className="product-name">
                  {cartItem.product.name}
                </div>
                <div className="product-price">
                  {formatMoney(cartItem.product.priceCents)}
                </div>
                <div className="product-quantity">
                  {editingQuantity === cartItem.productId ? (
                    <>
                      <span>Quantity: </span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                        className="quantity-input"
                      />
                      <button
                        className="save-quantity-link link-primary"
                        onClick={() => updateQuantity(cartItem.productId)}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-quantity-link link-primary"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>
                        Quantity: <span className="quantity-label">{cartItem.quantity}</span>
                      </span>
                      <span
                        className="update-quantity-link link-primary"
                        onClick={() => startEditing(cartItem)}
                      >
                        Update
                      </span>
                      <span className="delete-quantity-link link-primary"
                        onClick={deleteCartItem}>
                        Delete
                      </span>
                    </>
                  )}
                </div>
              </div>

              <DeliveryOptions cartItem={cartItem} deliveryOptions={deliveryOptions}
                loadCart={loadCart} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
