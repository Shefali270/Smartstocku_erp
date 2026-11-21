import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'smartstock_products';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Wireless Mechanical Keyboard', sku: 'SKU-1042', category: 'Peripherals', stock: 24, price: 3499, image: '' },
  { id: 2, name: 'USB-C Multiport Hub', sku: 'SKU-1089', category: 'Accessories', stock: 4, price: 1850, image: '' },
  { id: 3, name: '27" 4K IPS Monitor', sku: 'SKU-2011', category: 'Electronics', stock: 12, price: 24500, image: '' },
  { id: 4, name: 'Ergonomic Wireless Mouse', sku: 'SKU-1105', category: 'Peripherals', stock: 3, price: 1299, image: '' },
];

export default function ProductsStock() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('SKU-1200');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState(10);
  const [price, setPrice] = useState(1000);
  const [image, setImage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('storage'));
  }, [products]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // base64 image string
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd = {
      id: Date.now(),
      name: name.trim(),
      sku: sku.trim() || 'SKU-NEW',
      category: category.trim() || 'Electronics',
      stock: Number(stock) || 0,
      price: Number(price) || 0,
      image, // selected file image
    };

    setProducts((prev) => [...prev, newProd]);
    setName('');
    setImage('');
    setShowForm(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Products & Stock</h2>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          + Add New Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Product Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. TV / Cube" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Price (₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Product Image (File)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', fontSize: '12px' }} />
          </div>

          {image && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={image} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px' }} />
              <span style={{ fontSize: '12px', color: '#475569' }}>Selected image preview</span>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px' }}>
            <th style={{ padding: '12px' }}>Image</th>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>SKU</th>
            <th style={{ padding: '12px' }}>Category</th>
            <th style={{ padding: '12px' }}>Stock</th>
            <th style={{ padding: '12px' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
              <td style={{ padding: '10px 12px' }}>
                {p.image ? (
                  <img src={p.image} alt={p.name} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px' }} />
                ) : (
                  <span>📦</span>
                )}
              </td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>{p.name}</td>
              <td style={{ padding: '10px 12px' }}>{p.sku}</td>
              <td style={{ padding: '10px 12px' }}>{p.category}</td>
              <td style={{ padding: '10px 12px' }}>{p.stock}</td>
              <td style={{ padding: '10px 12px' }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}