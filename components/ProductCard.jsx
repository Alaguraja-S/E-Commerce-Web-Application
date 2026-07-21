import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-media-placeholder">{product.name.slice(0, 1)}</div>
        )}
      </Link>
      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <Link to={`/products/${product._id}`} className="product-name">{product.name}</Link>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <button
          className="btn btn-primary btn-full"
          disabled={outOfStock}
          onClick={() => addToCart(product, 1)}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
