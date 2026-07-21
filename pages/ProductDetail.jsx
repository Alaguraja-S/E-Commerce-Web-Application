import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setError('');
    setProduct(null);
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => setError('Product not found.'));
  }, [id]);

  if (error) return <div className="page"><p className="form-error">{error}</p><Link to="/">Back to shop</Link></div>;
  if (!product) return <div className="page"><p className="muted">Loading…</p></div>;

  return (
    <div className="page product-detail">
      <div className="product-media large">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-media-placeholder">{product.name.slice(0, 1)}</div>
        )}
      </div>
      <div>
        <p className="product-category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-price large">${product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        <p className="muted">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

        <div className="qty-row">
          <input
            type="number"
            min={1}
            max={Math.max(product.stock, 1)}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
            disabled={product.stock <= 0}
          />
          <button
            className="btn btn-primary"
            disabled={product.stock <= 0}
            onClick={() => { addToCart(product, qty); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
          >
            {product.stock <= 0 ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
