import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = { name: '', description: '', price: '', category: '', stock: '', imageUrl: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  function loadProducts() {
    setLoading(true);
    api.get('/products', { params: { limit: 50 } })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }

  useEffect(loadProducts, []);

  function startEdit(p) {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock, imageUrl: p.imageUrl || '' });
  }
  function startNew() {
    setEditingId('new');
    setForm(emptyForm);
  }
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      imageUrl: form.imageUrl
    };
    try {
      if (editingId === 'new') {
        await api.post('/products', payload);
      } else {
        await api.put(`/products/${editingId}`, payload);
      }
      cancelEdit();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <div className="page">
      <div className="admin-head">
        <h1>Manage products</h1>
        <button className="btn btn-primary" onClick={startNew}>+ New product</button>
      </div>

      {editingId && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{editingId === 'new' ? 'New product' : 'Edit product'}</h2>
          {error && <p className="form-error">{error}</p>}
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-row">
            <label>Price ($)<input type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label>Stock<input type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
          </div>
          <label>Category<input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label>Image URL (optional)<input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>
          <div className="form-row">
            <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-primary">{editingId === 'new' ? 'Create product' : 'Save changes'}</button>
          </div>
        </form>
      )}

      {loading ? <p className="muted">Loading…</p> : (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td className="admin-table-actions">
                  <button className="btn" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
