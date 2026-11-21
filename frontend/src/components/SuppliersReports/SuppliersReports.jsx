import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const SUPPLIERS_KEY = 'smartstock_suppliers_v1';
const PO_KEY = 'smartstock_purchase_orders_v1';

const defaultSuppliers = [
  { id: 'SUP-01', name: 'TechWorld Distributors', contact: '+91 98765 43210', city: 'New Delhi', gst: '07AABCT1234F1Z5', status: 'Active' },
  { id: 'SUP-02', name: 'Global Peripherals Ltd', contact: '+91 91234 56789', city: 'Mumbai', gst: '27AABCG5678H1Z2', status: 'Active' },
  { id: 'SUP-03', name: 'Prime Cable & Accessories', contact: '+91 99887 76655', city: 'Bengaluru', gst: '29AABCP9012K1Z9', status: 'Pending' },
];

const defaultOrders = [
  { po: 'PO-2026-081', supplier: 'TechWorld Distributors', date: '15 Nov 2026', items: '45 Units', amount: '₹1,24,000', status: 'Delivered' },
  { po: 'PO-2026-082', supplier: 'Global Peripherals Ltd', date: '17 Nov 2026', items: '20 Units', amount: '₹58,500', status: 'In Transit' },
  { po: 'PO-2026-083', supplier: 'Prime Cable & Accessories', date: '18 Nov 2026', items: '100 Units', amount: '₹32,000', status: 'Pending' },
];

export function SuppliersModule() {
  const emptySupplier = {
    name: '',
    contact: '',
    city: '',
    gst: '',
    status: 'Active',
  };

  const [suppliers, setSuppliers] = useState(() => {
    try {
      const saved = localStorage.getItem(SUPPLIERS_KEY);
      return saved ? JSON.parse(saved) : defaultSuppliers;
    } catch {
      return defaultSuppliers;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
    } catch (e) {
      console.error('Failed to save suppliers:', e);
    }
  }, [suppliers]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptySupplier);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptySupplier);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingId(sup.id);
    setFormData({
      name: sup.name,
      contact: sup.contact,
      city: sup.city,
      gst: sup.gst,
      status: sup.status,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptySupplier);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setSuppliers(
        suppliers.map((s) => (s.id === editingId ? { ...s, ...formData } : s))
      );
    } else {
      const nextNum = String(suppliers.length + 1).padStart(2, '0');
      setSuppliers([
        ...suppliers,
        { id: `SUP-${nextNum}-${Date.now().toString().slice(-2)}`, ...formData },
      ]);
    }
    handleCloseForm();
  };

  const handleDelete = (id) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
    if (editingId === id) handleCloseForm();
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Suppliers Directory</h1>
        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '9px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              {editingId ? `Edit Supplier (${editingId})` : 'Add New Supplier'}
            </h2>
            <button
              type="button"
              onClick={handleCloseForm}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Vendor Name</label>
              <input
                required
                placeholder="e.g. Apex Electronics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Contact Number</label>
              <input
                required
                placeholder="+91 98765 00000"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>City</label>
              <input
                required
                placeholder="New Delhi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>GSTIN</label>
              <input
                required
                placeholder="07AABCT1234F1Z5"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: editingId ? '#2563eb' : '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontWeight: 600,
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

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 16px' }}>ID</th>
              <th style={{ padding: '14px 16px' }}>Vendor Name</th>
              <th style={{ padding: '14px 16px' }}>Contact</th>
              <th style={{ padding: '14px 16px' }}>City</th>
              <th style={{ padding: '14px 16px' }}>GSTIN</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: editingId === s.id ? '#eff6ff' : '#fff' }}>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{s.id}</td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: '14px 16px' }}>{s.contact}</td>
                <td style={{ padding: '14px 16px' }}>{s.city}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{s.gst}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: s.status === 'Active' ? '#dcfce7' : '#fef3c7',
                      color: s.status === 'Active' ? '#16a34a' : '#d97706',
                    }}
                  >
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      title="Edit Supplier"
                      style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: '#2563eb' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      title="Delete Supplier"
                      style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PurchaseOrdersModule() {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(PO_KEY);
      return saved ? JSON.parse(saved) : defaultOrders;
    } catch {
      return defaultOrders;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PO_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save POs:', e);
    }
  }, [orders]);

  const [showForm, setShowForm] = useState(false);
  const [poForm, setPoForm] = useState({ supplier: '', date: '19 Nov 2026', items: '', amount: '', status: 'Pending' });

  const handleCreatePO = (e) => {
    e.preventDefault();
    const nextPo = `PO-2026-${String(orders.length + 1).padStart(3, '0')}`;
    setOrders([
      ...orders,
      {
        po: nextPo,
        supplier: poForm.supplier,
        date: poForm.date,
        items: poForm.items,
        amount: poForm.amount.startsWith('₹') ? poForm.amount : `₹${poForm.amount}`,
        status: poForm.status,
      },
    ]);
    setPoForm({ supplier: '', date: '19 Nov 2026', items: '', amount: '', status: 'Pending' });
    setShowForm(false);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Purchase Orders</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Create PO
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePO} style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <input required placeholder="Supplier Name" value={poForm.supplier} onChange={(e) => setPoForm({ ...poForm, supplier: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          <input required placeholder="Order Date (e.g. 19 Nov 2026)" value={poForm.date} onChange={(e) => setPoForm({ ...poForm, date: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          <input required placeholder="Quantity (e.g. 30 Units)" value={poForm.items} onChange={(e) => setPoForm({ ...poForm, items: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          <input required placeholder="Amount (e.g. 45,000)" value={poForm.amount} onChange={(e) => setPoForm({ ...poForm, amount: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px', fontWeight: 600, cursor: 'pointer' }}>Save PO</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 16px' }}>PO Number</th>
              <th style={{ padding: '14px 16px' }}>Supplier</th>
              <th style={{ padding: '14px 16px' }}>Order Date</th>
              <th style={{ padding: '14px 16px' }}>Quantity</th>
              <th style={{ padding: '14px 16px' }}>Total Amount</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.po} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#2563eb' }}>{o.po}</td>
                <td style={{ padding: '14px 16px' }}>{o.supplier}</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{o.date}</td>
                <td style={{ padding: '14px 16px' }}>{o.items}</td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{o.amount}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: o.status === 'Delivered' ? '#dcfce7' : '#dbeafe', color: o.status === 'Delivered' ? '#16a34a' : '#2563eb' }}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsModule() {
  const invoices = [
    { inv: 'INV-9012', customer: 'Aarav Sharma', date: '18 Nov 2026', tax: '₹2,160', total: '₹14,160' },
    { inv: 'INV-9011', customer: 'Neha Verma', date: '18 Nov 2026', tax: '₹900', total: '₹5,900' },
    { inv: 'INV-9010', customer: 'Rohan Enterprises', date: '17 Nov 2026', tax: '₹6,480', total: '₹42,480' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Sales & GST Reports</h1>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 16px' }}>Invoice ID</th>
              <th style={{ padding: '14px 16px' }}>Customer Name</th>
              <th style={{ padding: '14px 16px' }}>Date</th>
              <th style={{ padding: '14px 16px' }}>GST Collected</th>
              <th style={{ padding: '14px 16px' }}>Grand Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((r) => (
              <tr key={r.inv} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{r.inv}</td>
                <td style={{ padding: '14px 16px' }}>{r.customer}</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.date}</td>
                <td style={{ padding: '14px 16px', color: '#16a34a' }}>{r.tax}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SettingsModule() {
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '650px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Store & System Settings</h1>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Store / Company Name</label>
          <input defaultValue="SmartStock Electronics & Retail" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>GSTIN Number</label>
            <input defaultValue="07AABCS1429B1Z5" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Default Tax Rate (%)</label>
            <input defaultValue="18" type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSaved(true)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          Save Settings
        </button>
        {saved && <span style={{ marginLeft: '14px', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>✓ Settings Updated!</span>}
      </div>
    </div>
  );
}