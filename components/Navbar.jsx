import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Grainhouse</Link>
        <nav className="nav-links">
          <Link to="/">Shop</Link>
          {user && <Link to="/orders">My orders</Link>}
          {isAdmin && <Link to="/admin/products">Products (admin)</Link>}
          {isAdmin && <Link to="/admin/orders">Orders (admin)</Link>}
        </nav>
        <div className="nav-right">
          <Link to="/cart" className="cart-link">
            Cart{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
