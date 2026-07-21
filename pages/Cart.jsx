import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty. <Link to="/">Browse products</Link></p>
      </div>
    );
  }

  function goToCheckout() {
    navigate(isAuthenticated ? '/checkout' : '/login', {
      state: !isAuthenticated ? { from: { pathname: '/checkout' } } : undefined
    });
  }

  return (
    <div className="page">
      <h1>Your cart</h1>
      <div className="cart-list">
        {items.map((item) => (
          <div className="cart-row" key={item.productId}>
            <div className="cart-row-media">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="product-media-placeholder small">{item.name.slice(0,1)}</div>}
            </div>
            <div className="cart-row-info">
              <p className="product-name">{item.name}</p>
              <p className="muted">${item.price.toFixed(2)} each</p>
            </div>
            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
            />
            <p className="cart-row-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
            <button className="btn btn-ghost" onClick={() => removeFromCart(item.productId)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <span>Total</span>
        <span className="cart-total">${totalPrice.toFixed(2)}</span>
      </div>
      <button className="btn btn-primary btn-full" onClick={goToCheckout}>Proceed to checkout</button>
    </div>
  );
}
