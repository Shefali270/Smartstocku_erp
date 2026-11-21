import React, { useEffect, useState } from 'react';
import Sidebar from './components/sidebar/sidebar.jsx';
import AdminDashboard from './components/AdminDashboard/AdminDashboard.jsx';
import InventoryManager from './components/InventoryManager/InventoryManager.jsx';
import POSBilling from './components/POSBilling/POSBilling.jsx';
import { SettingsModule } from "./components/SettingsModule/SettingsModule.jsx";
import {
  SuppliersModule,
  PurchaseOrdersModule,
  ReportsModule,
} from './components/SuppliersReports/SuppliersReports.jsx';

const STORAGE_KEY = 'smartstock_products';

const DEFAULT_PRODUCTS = [
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

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage parse error
    }
    return DEFAULT_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore storage quota error
    }
  }, [products]);

  const handleAddProduct = (newProd) => {
    const formatted = {
      id: newProd.id || Date.now(),
      name: (newProd.name || '').trim(),
      sku: (newProd.sku || 'SKU-NEW').trim(),
      category: (newProd.category || 'Electronics').trim(),
      stock: Number(newProd.stock) || 0,
      price: Number(newProd.price) || 0,
      image: newProd.image || '',
      icon: newProd.icon || '📦',
    };
    if (!formatted.name) return;
    setProducts((prev) => [...prev, formatted]);
  };

  const handleUpdateProduct = (updatedProd) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === updatedProd.id
          ? {
              ...p,
              ...updatedProd,
              stock: Number(updatedProd.stock) || 0,
              price: Number(updatedProd.price) || 0,
            }
          : p
      )
    );
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeductStock = (cartItems) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return;
    setProducts((prev) =>
      prev.map((prod) => {
        const match = cartItems.find(
          (item) =>
            item.id === prod.id ||
            (item.name && prod.name && item.name.toLowerCase() === prod.name.toLowerCase())
        );
        if (!match) return prod;
        const currentStock = Number(prod.stock) || 0;
        const qty = Number(match.qty) || 0;
        return { ...prod, stock: Math.max(0, currentStock - qty) };
      })
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', width: '100%' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
        {activePage === 'dashboard' && (
          <AdminDashboard products={products} />
        )}

        {activePage === 'inventory' && (
          <InventoryManager
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activePage === 'pos' && (
          <POSBilling
            products={products}
            onDeductStock={handleDeductStock}
          />
        )}

        {activePage === 'suppliers' && <SuppliersModule />}
        {activePage === 'purchase-orders' && <PurchaseOrdersModule />}
        {activePage === 'reports' && <ReportsModule />}
        {activePage === 'settings' && <SettingsModule />}
      </main>
    </div>
  );
}

export default App;