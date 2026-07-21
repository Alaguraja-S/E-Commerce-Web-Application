import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: '', addressLine: '', city: '', postalCode: '', country: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address
      });
      clearCart();
      navigate('/orders', { state: { justPlacedOrderId: res.data.order._id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="page"><p className="muted">Your cart is empty.</p></div>;
  }

  return (
    <div className="page checkout-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Checkout</h1>
        {error && <p className="form-error">{error}</p>}
        <label>Full name
          <input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
        </label>
        <label>Address
          <input required value={address.addressLine} onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} />
        </label>
        <div className="form-row">
          <label>City
            <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          </label>
          <label>Postal code
            <input required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
          </label>
        </div>
        <label>Country
          <input required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
        </label>
        <div className="cart-summary">
          <span>Order total</span>
          <span className="cart-total">${totalPrice.toFixed(2)}</span>
        </div>
        <button className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </div>
  );
}
