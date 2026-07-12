import { useState, useEffect } from 'react';
import { fetchVendorMenu, addMenuItem, toggleMenuItemAvailability, deleteMenuItem } from '../../api';

const EMPTY_FORM = { name: '', description: '', price: '', category: 'Main Course', image: '', isVeg: false };
const CATEGORIES = ['Starters', 'Main Course', 'Sides', 'Desserts', 'Beverages', 'Popular'];

export default function VendorMenuEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendorMenu()
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await addMenuItem(form);
      setItems(prev => [res.data, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally { setSaving(false); }
  };

  const handleToggle = async (item) => {
    const newVal = !item.isAvailable;
    setItems(prev => prev.map(i => i._id === item._id ? { ...i, isAvailable: newVal } : i));
    try { await toggleMenuItemAvailability(item._id, newVal); }
    catch { setItems(prev => prev.map(i => i._id === item._id ? { ...i, isAvailable: item.isAvailable } : i)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    setItems(prev => prev.filter(i => i._id !== id));
    try { await deleteMenuItem(id); }
    catch { /* ignore */ }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});
  const otherItems = items.filter(i => !CATEGORIES.includes(i.category));
  if (otherItems.length) grouped['Other'] = otherItems;

  return (
    <div>
      <div className="vendor-section-header">
        <div>
          <h2 className="vendor-section-title">Menu Editor</h2>
          <p className="vendor-section-sub">{items.length} items on your menu</p>
        </div>
        <button className="vendor-add-btn" id="vendor-add-item-btn" onClick={() => setShowForm(prev => !prev)}>
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div className="vendor-add-form-card">
          <h3 className="vendor-form-title">New Menu Item</h3>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleAdd} className="vendor-add-form">
            <div className="vendor-form-row">
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="form-input" placeholder="e.g. Cheese Burger" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input className="form-input" type="number" step="0.01" min="0" placeholder="12.99" required
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="vendor-form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" placeholder="https://..." type="url"
                  value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Describe this dish…"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="vendor-form-check">
              <label>
                <input type="checkbox" checked={form.isVeg}
                  onChange={e => setForm({ ...form, isVeg: e.target.checked })} />
                {' '} Vegetarian 🌿
              </label>
            </div>
            <button className="auth-submit" type="submit" disabled={saving}
              id="vendor-save-item-btn">
              {saving ? 'Saving…' : 'Save Item'}
            </button>
          </form>
        </div>
      )}

      {/* Menu Table */}
      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="vendor-menu-sections">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="vendor-menu-section">
              <div className="vendor-menu-cat-header">{cat} <span className="vendor-menu-cat-count">{catItems.length}</span></div>
              <div className="vendor-menu-table">
                <div className="vendor-menu-table-head">
                  <span>Item</span><span>Price</span><span>Available</span><span>Actions</span>
                </div>
                {catItems.map(item => (
                  <div key={item._id} className={`vendor-menu-row ${!item.isAvailable ? 'vendor-menu-row--unavail' : ''}`}
                    id={`menu-row-${item._id}`}>
                    <div className="vendor-menu-row-info">
                      {item.image && <img src={item.image} alt={item.name} className="vendor-menu-thumb" />}
                      <div>
                        <div className="vendor-menu-item-name">{item.name} {item.isVeg ? '🌿' : ''}</div>
                        <div className="vendor-menu-item-desc">{item.description}</div>
                      </div>
                    </div>
                    <div className="vendor-menu-price">${item.price?.toFixed(2)}</div>
                    <div>
                      <button
                        className={`vendor-avail-toggle ${item.isAvailable ? 'on' : ''}`}
                        onClick={() => handleToggle(item)}
                        id={`avail-toggle-${item._id}`}
                        aria-label={item.isAvailable ? 'Mark out of stock' : 'Mark available'}
                      >
                        <span className="vendor-avail-knob" />
                      </button>
                    </div>
                    <div>
                      <button className="vendor-delete-btn" onClick={() => handleDelete(item._id)}
                        id={`delete-item-${item._id}`} aria-label="Delete item">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="vendor-empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🍽️</div>
              <p>No menu items yet. Add your first item above!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
