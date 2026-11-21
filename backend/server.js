const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const DATA_FILE = path.join(__dirname, 'settings.json');

const DEFAULT_SETTINGS = {
  storeName: 'SmartStock Electronics & Retail',
  gstin: '07AABCS1429B1Z5',
  defaultTaxRate: 18,
};

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});

