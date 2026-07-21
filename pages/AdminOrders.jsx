import { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    setLoading(true);
    api.get('/orders', { params: { status: statusFilter } })
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }

  useEffect(loadOrders, [statusFilter]);

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    loadOrders();
  }

  return (
    <div className="page">
      <div className="admin-head">
        <h1>Manage orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <p className="muted">Loading…</p> : orders.length === 0 ? (
        <p className="muted">No orders found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="mono">#{o._id.slice(-8)}</td>
                <td>{o.user?.name || 'Unknown'}<br /><span className="muted">{o.user?.email}</span></td>
                <td>{o.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                <td>${o.totalPrice.toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
