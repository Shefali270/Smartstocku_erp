import React, { useEffect, useState } from 'react';
import { Trash2, Printer } from 'lucide-react';

const DEFAULT_CATALOG = [
  { id: 1, name: 'Wireless Mouse', price: 1250, icon: '🖱️', stock: 20 },
  { id: 2, name: 'Mechanical Keyboard', price: 3400, icon: '⌨️', stock: 24 },
  { id: 3, name: 'USB-C Hub', price: 1850, icon: '🔌', stock: 15 },
  { id: 4, name: 'HD Webcam', price: 2900, icon: '📷', stock: 12 },
  { id: 5, name: 'Laptop Stand', price: 1450, icon: '💻', stock: 18 },
  { id: 6, name: 'Noise Cancel Headset', price: 4500, icon: '🎧', stock: 10 },
];

const getCategoryIcon = (category = '') => {
  const key = category.toLowerCase();
  if (key.includes('laptop') || key.includes('computer')) return '💻';
  if (key.includes('phone') || key.includes('mobile')) return '📱';
  if (key.includes('keyboard')) return '⌨️';
  if (key.includes('mouse')) return '🖱️';
  if (key.includes('monitor') || key.includes('display')) return '🖥️';
  if (key.includes('audio') || key.includes('headset')) return '🎧';
  return '📦';
};

const isImageUrl = (val = '') =>
  typeof val === 'string' &&
  (val.startsWith('http://') ||
    val.startsWith('https://') ||
    val.startsWith('/') ||
    val.startsWith('data:image'));

const readStoredProducts = () => {
  const possibleKeys = ['products', 'smartstock_products', 'inventory_products'];
  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { storageKey: key, items: parsed };
        }
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return { storageKey: null, items: null };
};

const POSBilling = () => {
  const [products, setProducts] = useState(() => {
    const stored = readStoredProducts();
    return stored.items || DEFAULT_CATALOG;
  });

  useEffect(() => {
    const syncProducts = () => {
      const stored = readStoredProducts();
      if (stored.items) {
        setProducts(stored.items);
      }
    };
    syncProducts();
    window.addEventListener('storage', syncProducts);
    return () => window.removeEventListener('storage', syncProducts);
  }, []);

  const [customer, setCustomer] = useState('Walk-in Customer');
  const [cart, setCart] = useState([
    { id: 1, name: 'Wireless Mouse', price: 1250, qty: 2 },
    { id: 2, name: 'Mechanical Keyboard', price: 3400, qty: 1 },
  ]);

  const addToCart = (prod) => {
    const price = Number(prod.price) || 0;
    const exists = cart.find((i) => i.id === prod.id);
    if (exists) {
      setCart(cart.map((i) => (i.id === prod.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { id: prod.id, name: prod.name, price, qty: 1 }]);
    }
  };

  const deductStockOnPrint = () => {
    const stored = readStoredProducts();
    if (stored.storageKey && Array.isArray(stored.items)) {
      const updated = stored.items.map((prod) => {
        const cartItem = cart.find(
          (c) => c.id === prod.id || c.name?.toLowerCase() === prod.name?.toLowerCase()
        );
        if (!cartItem) return prod;
        const currentStock = Number(prod.stock ?? prod.quantity ?? 0);
        const nextStock = Math.max(0, currentStock - Number(cartItem.qty || 0));
        return { ...prod, stock: nextStock };
      });
      localStorage.setItem(stored.storageKey, JSON.stringify(updated));
      setProducts(updated);
    }
    window.print();
  };

  const subtotal = cart.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  const grandTotal = subtotal + cgst + sgst;

  const renderVisual = (item) => {
    const imgSource = item.image || item.img || item.photo;
    if (isImageUrl(imgSource)) {
      return (
        <img
          src={imgSource}
          alt={item.name}
          style={{
            width: '44px',
            height: '44px',
            objectFit: 'contain',
            margin: '0 auto 8px auto',
            display: 'block',
            borderRadius: '6px',
          }}
        />
      );
    }
    const visual = item.icon || imgSource || getCategoryIcon(item.category);
    return <div style={{ fontSize: '28px', marginBottom: '8px' }}>{visual}</div>;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', fontFamily: 'Inter, sans-serif' }}>
      {/* Left: Product Selection Grid */}
      <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Select Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {products.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f8fafc',
                transition: '0.2s',
              }}
            >
              {renderVisual(item)}
              <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0', color: '#0f172a' }}>{item.name}</p>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: New GST Bill */}
      <div style={{ background: '#fff', padding: '22px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0' }}>New GST Bill</h2>
          <input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Customer Name / Mobile"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px', fontSize: '13px', boxSizing: 'border-box' }}
          />

          <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Qty: {item.qty} × ₹{item.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong>₹{item.price * item.qty}</strong>
                  <Trash2 size={15} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => setCart(cart.filter((c) => c.id !== item.id))} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748b' }}><span>CGST (9%)</span><span>₹{cgst}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}><span>SGST (9%)</span><span>₹{sgst}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
            <span>Grand Total</span>
            <span style={{ color: '#16a34a' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '16px' }}>
            <button onClick={() => setCart([])} style={{ background: '#f1f5f9', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
            <button onClick={deductStockOnPrint} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Printer size={16} /> Generate & Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSBilling;