import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';

const STORAGE_KEY = 'smartstock_products';

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Mechanical Keyboard',
    sku: 'SKU-1042',
    category: 'Peripherals',
    stock: 24,
    price: 3499,
    image: '',
    icon: '⌨️',
  },
  {
    id: 2,
    name: 'USB-C Multiport Hub',
    sku: 'SKU-1089',
    category: 'Accessories',
    stock: 4,
    price: 1850,
    image: '',
    icon: '🔌',
  },
  {
    id: 3,
    name: '27" 4K IPS Monitor',
    sku: 'SKU-2011',
    category: 'Electronics',
    stock: 12,
    price: 24500,
    image: '',
    icon: '🖥️',
  },
  {
    id: 4,
    name: 'Ergonomic Wireless Mouse',
    sku: 'SKU-1105',
    category: 'Peripherals',
    stock: 3,
    price: 1299,
    image: '',
    icon: '🖱️',
  },
  {
    id: 5,
    name: 'cube',
    sku: 'SKU-1040',
    category: 'Electronics',
    stock: 10,
    price: 1000,
    image: '',
    icon: '📦',
  },
];

export default function InventoryManager({
  products: externalProducts,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) {
  const [localProducts, setLocalProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage error
    }
    return INITIAL_PRODUCTS;
  });

  const productsList =
    Array.isArray(externalProducts) && externalProducts.length > 0
      ? externalProducts
      : localProducts;

  useEffect(() => {
    if (!Array.isArray(externalProducts)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localProducts));
        window.dispatchEvent(new Event('storage'));
      } catch {
        // ignore storage quota error
      }
    }
  }, [localProducts, externalProducts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('SKU-1200');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState(10);
  const [price, setPrice] = useState(1000);
  const [image, setImage] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSku('SKU-1200');
    setCategory('Electronics');
    setStock(10);
    setPrice(1000);
    setImage('');
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategory('Electronics');
    setStock(10);
    setPrice(1000);
    setImage('');
    setShowForm(true);
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name || '');
    setSku(prod.sku || '');
    setCategory(prod.category || 'Electronics');
    setStock(prod.stock ?? 0);
    setPrice(prod.price ?? 0);
    setImage(prod.image || '');
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (typeof onDeleteProduct === 'function') {
      onDeleteProduct(id);
    }
    setLocalProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numericStock = Number(stock) || 0;
    const numericPrice = Number(price) || 0;

    if (editingId !== null) {
      const existing = productsList.find((p) => p.id === editingId) || {};
      const updatedProd = {
        ...existing,
        id: editingId,
        name: name.trim(),
        sku: sku.trim() || existing.sku || 'SKU-NEW',
        category: category.trim() || 'Electronics',
        stock: numericStock,
        price: numericPrice,
        image: image || existing.image || '',
        icon: existing.icon || '📦',
      };

      if (typeof onUpdateProduct === 'function') {
        onUpdateProduct(updatedProd);
      }
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === editingId ? updatedProd : p))
      );
    } else {
      const newProd = {
        id: Date.now(),
        name: name.trim(),
        sku: sku.trim() || 'SKU-NEW',
        category: category.trim() || 'Electronics',
        stock: numericStock,
        price: numericPrice,
        image,
        icon: '📦',
      };

      if (typeof onAddProduct === 'function') {
        onAddProduct(newProd);
      }
      setLocalProducts((prev) => {
        const next = [...prev, newProd];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event('storage'));
        } catch {
          // ignore storage quota error
        }
        return next;
      });
    }

    resetForm();
  };

  const filteredProducts = productsList.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#0f172a' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>
          Products &amp; Stock
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product or SKU..."
              style={{
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '13px',
                width: '220px',
              }}
            />
          </div>

          <button
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {/* Add New Product Form with File Upload */}
      {showForm && (
        <form
          onSubmit={handleSave}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              {editingId !== null ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
              alignItems: 'end',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '5px',
                  color: '#334155',
                }}
              >
                Product Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Name"
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '5px',
                  color: '#334155',
                }}
              >
                SKU
              </label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '5px',
                  color: '#334155',
                }}
              >
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '5px',
                  color: '#334155',
                }}
              >
                Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '5px',
                  color: '#334155',
                }}
              >
                Price (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* File Upload Input + Image Preview + Save/Cancel */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '14px',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    color: '#334155',
                  }}
                >
                  Product Image (File)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: '12px' }}
                />
              </div>

              {image && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <img
                    src={image}
                    alt="Preview"
                    style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    Image selected
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: '#fff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '8px 14px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                textAlign: 'left',
                fontSize: '12px',
                color: '#475569',
              }}
            >
              <th style={{ padding: '12px 16px' }}>Image</th>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>SKU</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Stock</th>
              <th style={{ padding: '12px 16px' }}>Price</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const isLow = Number(p.stock) <= 5;
              return (
                <tr
                  key={p.id}
                  style={{ borderTop: '1px solid #f1f5f9', fontSize: '13px' }}
                >
                  <td style={{ padding: '10px 16px' }}>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: '34px',
                          height: '34px',
                          objectFit: 'contain',
                          borderRadius: '5px',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '20px' }}>{p.icon || '📦'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {p.sku}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {p.category}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    ₹{Number(p.price).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: isLow ? '#fee2e2' : '#dcfce7',
                        color: isLow ? '#dc2626' : '#15803d',
                      }}
                    >
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Pencil
                        size={15}
                        style={{ cursor: 'pointer', color: '#2563eb' }}
                        onClick={() => handleEdit(p)}
                      />
                      <Trash2
                        size={15}
                        style={{ cursor: 'pointer', color: '#dc2626' }}
                        onClick={() => handleDelete(p.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}