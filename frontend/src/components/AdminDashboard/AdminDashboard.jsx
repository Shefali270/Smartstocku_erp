import React, { useMemo, useState, useEffect } from 'react';
import './AdminDashboard.css';

const SETTINGS_KEY = 'smartstock_settings_v1';

const PERIOD_SERIES = {
  'This Week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [1200, 3600, 4100, 6900, 6600, 9600, 12500],
  },
  'Last 7 Days': {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    values: [2400, 4200, 5600, 6100, 7800, 9400, 11900],
  },
};

const DONUT_COLORS = ['#1e3a8a', '#ef4444', '#f59e0b', '#0d9488'];

const RECENT_SALES = [
  { inv: 'INV-089', customer: 'Aarav S.', items: 1, amount: 24000, status: 'Paid' },
  { inv: 'INV-087', customer: 'Rohan E.', items: 1, amount: 45500, status: 'Paid' },
  { inv: 'INV-086', customer: 'Aarav S.', items: 2, amount: 45000, status: 'Pending' },
  { inv: 'INV-085', customer: 'Rohan E.', items: 3, amount: 50000, status: 'Paid' },
  { inv: 'INV-084', customer: 'Aarav S.', items: 2, amount: 20000, status: 'Paid' },
];

function formatINR(num) {
  return `₹${Number(num || 0).toLocaleString('en-IN')}`;
}

export default function AdminDashboard({ products = [] }) {
  const [range, setRange] = useState('This Week');
  const [search, setSearch] = useState('');
  const [storeName, setStoreName] = useState('SmartStock ERP');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.storeName) setStoreName(parsed.storeName);
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const stats = useMemo(() => {
    const inventoryValue = products.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.stock) || 0),
      0
    );
    const lowStockItems = products.filter((item) => (Number(item.stock) || 0) <= 5);
    const totalUnits = products.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);

    const catMap = {};
    products.forEach((p) => {
      const cat = p.category || 'General';
      catMap[cat] = (catMap[cat] || 0) + Math.max(1, Number(p.stock) || 0);
    });

    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const totalCat = entries.reduce((s, [, v]) => s + v, 0) || 1;

    const categories =
      entries.length > 0
        ? entries.map(([name, val], idx) => ({
            name,
            pct: Math.round((val / totalCat) * 100),
            color: DONUT_COLORS[idx % DONUT_COLORS.length],
          }))
        : [
            { name: 'Electronics', pct: 42, color: DONUT_COLORS[0] },
            { name: 'Peripherals', pct: 18, color: DONUT_COLORS[1] },
            { name: 'Accessories', pct: 28, color: DONUT_COLORS[2] },
            { name: 'Furniture', pct: 12, color: DONUT_COLORS[3] },
          ];

    return {
      inventoryValue: inventoryValue > 0 ? inventoryValue : 2450900,
      lowStockCount: lowStockItems.length,
      lowStockList: lowStockItems.length > 0 ? lowStockItems : products.slice(0, 4),
      totalUnits,
      categories,
    };
  }, [products]);

  const series = PERIOD_SERIES[range] || PERIOD_SERIES['This Week'];
  const maxVal = Math.max(...series.values, 12500);

  // Full width chart geometry inside viewBox="0 0 760 215"
  const chartPoints = useMemo(() => {
    const width = 760;
    const height = 178;
    const padLeft = 34;
    const padRight = 12;
    const padTop = 14;
    const padBottom = 14;
    const usableW = width - padLeft - padRight;
    const usableH = height - padTop - padBottom;

    return series.values.map((val, idx) => {
      const x =
        series.values.length === 1
          ? width / 2
          : padLeft + (idx / (series.values.length - 1)) * usableW;
      const y = padTop + usableH - (val / maxVal) * usableH;
      return { x, y, val, label: series.labels[idx] };
    });
  }, [series, maxVal]);

  const linePath = chartPoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${chartPoints[chartPoints.length - 1].x.toFixed(1)} 178 L ${chartPoints[0].x.toFixed(1)} 178 Z`
      : '';

  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const filteredSales = RECENT_SALES.filter(
    (row) =>
      row.inv.toLowerCase().includes(search.toLowerCase()) ||
      row.customer.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLowStock = stats.lowStockList.filter(
    (item) =>
      (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ad-page">
      <header className="ad-topbar">
        <div className="ad-brand-wrap">
          <div className="ad-brand-badge">SS</div>
          <div>
            <h1 className="ad-topbar-title">Admin Dashboard</h1>
            <div className="ad-topbar-sub">{storeName} • Inventory &amp; Billing</div>
          </div>
        </div>

        <div className="ad-topbar-right">
          <input
            type="text"
            className="ad-search-box"
            placeholder="Search SKU, invoice, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="ad-admin-pill">
            <span className="ad-avatar">AD</span>
            <span>Admin (Owner)</span>
          </div>
        </div>
      </header>

      <section className="ad-kpi-grid">
        <div className="ad-kpi-card ad-kpi-card--value">
          <div>
            <div className="ad-kpi-label">Total Inventory Value</div>
            <div className="ad-kpi-num">{formatINR(stats.inventoryValue)}</div>
            <div className="ad-kpi-sub ad-pos">↑ +5.8% this week</div>
          </div>
          <div className="ad-kpi-icon ad-icon-green">₹</div>
        </div>

        <div className="ad-kpi-card">
          <div>
            <div className="ad-kpi-label">Low Stock Items</div>
            <div className="ad-kpi-num">{stats.lowStockCount}</div>
            <div className="ad-kpi-sub ad-danger">↓ Immediate action needed</div>
          </div>
          <div className="ad-kpi-icon ad-icon-red">!</div>
        </div>

        <div className="ad-kpi-card">
          <div>
            <div className="ad-kpi-label">Pending Purchase Orders</div>
            <div className="ad-kpi-num">7</div>
            <div className="ad-kpi-sub ad-muted">7 POs active</div>
          </div>
          <div className="ad-kpi-icon ad-icon-blue">📦</div>
        </div>

        <div className="ad-kpi-card">
          <div>
            <div className="ad-kpi-label">Today&apos;s Sales (Orders)</div>
            <div className="ad-kpi-num">28</div>
            <div className="ad-kpi-sub ad-pos">↑ +12.4% today</div>
          </div>
          <div className="ad-kpi-icon ad-icon-blue">📈</div>
        </div>
      </section>

      <section className="ad-charts-grid">
        <div className="ad-card">
          <div className="ad-card-head">
            <h2 className="ad-card-title">Sales &amp; Revenue Overview</h2>
            <select
              className="ad-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="This Week">This Week</option>
              <option value="Last 7 Days">Last 7 Days</option>
            </select>
          </div>

          <svg
            viewBox="0 0 760 215"
            preserveAspectRatio="none"
            className="ad-chart-svg"
          >
            <defs>
              <linearGradient id="adAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = 14 + (1 - ratio) * 150;
              return (
                <g key={i}>
                  <line
                    x1="34"
                    y1={y}
                    x2="748"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="28"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10.5"
                    fill="#64748b"
                  >
                    {Math.round((maxVal * ratio) / 1000)}k
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill="url(#adAreaGrad)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {chartPoints.map((pt) => (
              <g key={pt.label}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text x={pt.x} y="198" textAnchor="middle" fontSize="11" fill="#475569">
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="ad-card">
          <div className="ad-card-head">
            <h2 className="ad-card-title">Category-wise Stock Distribution</h2>
          </div>

          <div className="ad-donut-wrap">
            <div className="ad-donut-box">
              <svg viewBox="0 0 160 160" width="168" height="168">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="18"
                />
                {(() => {
                  let currentAngle = -90;
                  return stats.categories.map((cat) => {
                    const dash = (cat.pct / 100) * circumference;
                    const rotateAngle = currentAngle;
                    currentAngle += (cat.pct / 100) * 360;

                    return (
                      <circle
                        key={cat.name}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="18"
                        strokeDasharray={`${dash} ${circumference}`}
                        strokeDashoffset="0"
                        transform={`rotate(${rotateAngle} 80 80)`}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="ad-donut-center">
                <span className="ad-donut-small">Active Stock</span>
                <span className="ad-donut-big">{stats.totalUnits}</span>
              </div>
            </div>

            <div className="ad-legend">
              {stats.categories.map((cat) => (
                <div className="ad-legend-item" key={cat.name}>
                  <span className="ad-legend-left">
                    <span className="ad-dot" style={{ background: cat.color }} />
                    {cat.name}
                  </span>
                  <strong>{cat.pct}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ad-tables-grid">
        <div className="ad-card">
          <div className="ad-card-head">
            <h2 className="ad-card-title">Recent Transactions (Sales)</h2>
            <span className="ad-pill-btn">Live Feed</span>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>INV</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((row) => (
                  <tr key={row.inv}>
                    <td><strong>{row.inv}</strong></td>
                    <td>{row.customer}</td>
                    <td>{row.items}</td>
                    <td>{formatINR(row.amount)}</td>
                    <td>
                      <span
                        className={
                          row.status === 'Paid' ? 'ad-status-paid' : 'ad-status-pending'
                        }
                      >
                        {row.status === 'Paid' ? 'Paid ✓' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-head">
            <h2 className="ad-card-title">Low Stock Alerts</h2>
            <span className="ad-pill-btn">Alerts</span>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item Name</th>
                  <th>Stock</th>
                  <th>Reorder</th>
                </tr>
              </thead>
              <tbody>
                {filteredLowStock.map((item) => (
                  <tr key={item.id || item.sku} className="ad-alert-row">
                    <td><strong>{item.sku || 'SKU-01'}</strong></td>
                    <td>{item.name}</td>
                    <td className="ad-danger"><strong>{item.stock ?? 0}</strong></td>
                    <td>10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}