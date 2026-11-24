const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const DATA_FILE = path.join(__dirname, 'settings.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const DEFAULT_SETTINGS = {
  storeName: 'SmartStock Electronics & Retail',
  gstin: '07AABCS1429B1Z5',
  defaultTaxRate: 18,
};

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

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

function readSettings() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function readProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2));
      return DEFAULT_PRODUCTS;
    }
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.products)) return parsed.products;
    return DEFAULT_PRODUCTS;
  } catch (err) {
    console.error('Error reading products:', err);
    return DEFAULT_PRODUCTS;
  }
}

function writeProducts(list) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2));
}

// Settings get karne ke liye API
app.get('/api/settings', (req, res) => {
  const settings = readSettings();
  res.json(settings);
});

// Settings save/update karne ke liye API
app.put('/api/settings', (req, res) => {
  const current = readSettings();
  const updated = {
    storeName:
      typeof req.body.storeName === 'string' && req.body.storeName.trim()
        ? req.body.storeName.trim()
        : current.storeName,
    gstin:
      typeof req.body.gstin === 'string' && req.body.gstin.trim()
        ? req.body.gstin.trim()
        : current.gstin,
    defaultTaxRate:
      req.body.defaultTaxRate !== undefined && req.body.defaultTaxRate !== ''
        ? Number(req.body.defaultTaxRate)
        : current.defaultTaxRate,
  };

  writeSettings(updated);
  res.json({
    message: 'Settings saved successfully',
    settings: updated,
  });
});

// Products get karne ke liye API
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json({ products });
});

// Products save/update karne ke liye API (image sahit)
app.put('/api/products', (req, res) => {
  const incoming = Array.isArray(req.body?.products)
    ? req.body.products
    : Array.isArray(req.body)
    ? req.body
    : null;

  if (!incoming) {
    return res.status(400).json({ message: 'Invalid products payload' });
  }

  const sanitized = incoming.map((item, index) => ({
    id: item.id ?? Date.now() + index,
    name: String(item.name || '').trim(),
    sku: String(item.sku || 'SKU-NEW').trim(),
    category: String(item.category || 'Electronics').trim(),
    stock: Number(item.stock) || 0,
    price: Number(item.price) || 0,
    image: typeof item.image === 'string' ? item.image : '',
    icon: typeof item.icon === 'string' && item.icon ? item.icon : '📦',
  }));

  writeProducts(sanitized);
  res.json({
    message: 'Products saved successfully',
    products: sanitized,
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});