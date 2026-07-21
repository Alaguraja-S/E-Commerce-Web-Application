import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusColors = {
  pending: 'status-pending',
  processing: 'status-processing',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled'
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine').then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="muted">Loading orders…</p></div>;
  if (orders.length === 0) return <div className="page"><h1>My orders</h1><p className="muted">You haven't placed any orders yet.</p></div>;

  return (
    <div className="page">
      <h1>My orders</h1>
      <div className="order-list">
        {orders.map((o) => (
          <div className="order-card" key={o._id}>
            <div className="order-card-head">
              <span className="mono">#{o._id.slice(-8)}</span>
              <span className={`status-badge ${statusColors[o.status]}`}>{o.status}</span>
            </div>
            <p className="muted">{new Date(o.createdAt).toLocaleString()}</p>
            <ul className="order-items">
              {o.items.map((it) => (
                <li key={it.product}>{it.quantity} × {it.name} — ${(it.price * it.quantity).toFixed(2)}</li>
              ))}
            </ul>
            <div className="order-card-foot">
              <span>Shipping to {o.shippingAddress.city}, {o.shippingAddress.country}</span>
              <span className="cart-total">${o.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
