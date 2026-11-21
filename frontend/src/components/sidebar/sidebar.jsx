import React from 'react';
import { 
 LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  ClipboardList, 
  BarChart3, 
  Settings  
} from 'lucide-react';
import './sidebar.css';

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'inventory', label: 'Products & Stock', icon: <Package size={19} /> },
    { id: 'pos', label: 'POS Billing', icon: <ShoppingCart size={19} /> },
    { id: 'suppliers', label: 'Suppliers', icon: <Truck size={19} /> },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: <ClipboardList size={19} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={19} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={19} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">📦</div>
        <div>
          <h1 className="sidebar-brand-title">SmartStock ERP</h1>
          <p className="sidebar-brand-subtitle">Inventory & Billing</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`sidebar-btn ${activePage === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="sidebar-footer">
        <div className="sidebar-profile-card">
          <div className="sidebar-avatar">A</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">Admin (Owner)</p>
            <p className="sidebar-user-email">admin@smartstock.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;