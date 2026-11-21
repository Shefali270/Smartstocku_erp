import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      const orderRes = await axios.get('http://localhost:5000/api/orders');

      const products = prodRes.data;
      const orders = orderRes.data;

      const revenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      const lowStock = products.filter(p => p.stock <= 5).length;

      setStats({
        productsCount: products.length,
        ordersCount: orders.length,
        totalRevenue: revenue,
        lowStockCount: lowStock,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Overview</h1>

      {/* Top 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box blue">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <p>Total Products</p>
            <h3>{stats.productsCount}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box green">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <p>Total Orders</p>
            <h3>{stats.ordersCount}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box indigo">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <p>Low Stock Alerts</p>
            <h3 style={{ color: '#dc2626' }}>{stats.lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Lower Section (Charts & Breakdown) */}
      <div className="dashboard-lower-grid">
        <div className="dashboard-box">
          <h2>Monthly Sales vs Profit Overview</h2>
          <div className="chart-placeholder">
            📊 Sales & Profit Bar Chart Rendering Here...
          </div>
        </div>

        <div className="dashboard-box">
          <h2>Top Selling Products</h2>
          <div className="chart-placeholder">
            🥧 Product Distribution Pie Chart...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;