import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/products', { params: { search, category, page, limit: 8 } })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data.products);
        setCategories(res.data.categories);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => !cancelled && setError('Could not load products. Is the API running?'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [search, category, page]);

  return (
    <div className="page">
      <div className="catalog-toolbar">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
        />
        <select value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="muted">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="muted">No products match your search.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
