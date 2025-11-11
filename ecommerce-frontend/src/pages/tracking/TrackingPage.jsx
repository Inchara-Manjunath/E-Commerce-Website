import "./tracking.css";
import { api } from "../../utils/api";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Header } from "../../components/Header";

export function TrackingPage() {
  const location = useLocation();
  const initialOrderId = location.state?.orderId;
  const initialProductId = location.state?.productId;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || null);

  useEffect(() => {
    let isMounted = true;
    if (!initialOrderId) {
      setIsLoading(false);
      return;
    }
    api.get('/api/orders?expand=products').then((response) => {
      if (!isMounted) return;
      const found = (response.data || []).find((o) => String(o.id) === String(initialOrderId));
      setOrder(found || null);
      setIsLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, [initialOrderId]);

  // Determine which product to display: selectedProductId -> match, else first.
  const currentProduct = useMemo(() => {
    if (!order?.products?.length) return null;
    if (selectedProductId) {
      return order.products.find(p => String(p.product.id) === String(selectedProductId)) || order.products[0];
    }
    return order.products[0];
  }, [order, selectedProductId]);

  const eta = currentProduct ? dayjs(currentProduct.estimatedDeliveryTimeMs).format('dddd, MMMM D') : null;

  return (
    <>
      <title>Tracking</title>
      <Header />
      <div className="tracking-page">
        <div className="order-tracking">
          <Link className="back-to-orders-link link-primary" to="/orders">
            View all orders
          </Link>

          {isLoading && (
            <div className="delivery-date">Loading tracking info...</div>
          )}

          {!isLoading && !order && (
            <div className="delivery-date">Order not found.</div>
          )}

          {!isLoading && order && (
            <>
              {/* Product selector when multiple products */}
              {order.products?.length > 1 && (
                <div className="product-info" style={{ marginBottom: '10px' }}>
                  Select item:
                  {" "}
                  {order.products.map(op => (
                    <button
                      key={op.product.id}
                      className={`button-secondary`}
                      style={{ marginLeft: '8px' }}
                      onClick={() => setSelectedProductId(op.product.id)}
                    >
                      {op.product.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="delivery-date">
                Arriving on {eta || '—'}
              </div>

              <div className="product-info">
                {currentProduct?.product?.name || 'Product'}
              </div>

              <div className="product-info">
                Quantity: {currentProduct?.quantity ?? '—'}
              </div>

              {currentProduct?.product?.image && (
                <img
                  className="product-image"
                  src={currentProduct.product.image}
                  alt={currentProduct?.product?.name || 'Product'}
                />
              )}

              <div className="progress-labels-container">
                <div className="progress-label">Preparing</div>
                <div className="progress-label current-status">Shipped</div>
                <div className="progress-label">Delivered</div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
