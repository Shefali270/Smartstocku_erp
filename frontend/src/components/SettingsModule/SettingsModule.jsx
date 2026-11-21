import React, { useState, useEffect } from 'react';
import './SettingsModule.css';

const SETTINGS_KEY = 'smartstock_settings_v1';
const NAME_HISTORY_KEY = 'smartstock_name_history_v1';
const SETTINGS_API_URL = 'http://localhost:5000/api/settings';

const defaultSettings = {
  storeName: 'SmartStock Electronics & Retail',
  gstin: '07AABCS1429B1Z5',
  defaultTaxRate: 18,
};

function getStoredSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        storeName: parsed.storeName ?? defaultSettings.storeName,
        gstin: parsed.gstin ?? defaultSettings.gstin,
        defaultTaxRate: parsed.defaultTaxRate ?? defaultSettings.defaultTaxRate,
      };
    }
  } catch (e) {
    console.error('Failed to read settings from localStorage:', e);
  }
  return defaultSettings;
}

function getStoredHistory() {
  try {
    const saved = localStorage.getItem(NAME_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function SettingsModule() {
  const initial = getStoredSettings();
  const [storeName, setStoreName] = useState(initial.storeName);
  const [gstin, setGstin] = useState(initial.gstin);
  const [defaultTaxRate, setDefaultTaxRate] = useState(initial.defaultTaxRate);
  const [nameHistory, setNameHistory] = useState(() => getStoredHistory());
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    let active = true;

    async function loadFromBackend() {
      try {
        const res = await fetch(SETTINGS_API_URL);
        if (!res.ok) return;
        const data = await res.json();
        const backendSettings = data?.settings || data;
        if (!active || !backendSettings) return;

        const hasLocal = Boolean(localStorage.getItem(SETTINGS_KEY));
        if (!hasLocal) {
          const synced = {
            storeName: backendSettings.storeName ?? defaultSettings.storeName,
            gstin: backendSettings.gstin ?? defaultSettings.gstin,
            defaultTaxRate: backendSettings.defaultTaxRate ?? defaultSettings.defaultTaxRate,
          };
          setStoreName(synced.storeName);
          setGstin(synced.gstin);
          setDefaultTaxRate(synced.defaultTaxRate);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(synced));
        }
      } catch (e) {
        console.error('Backend settings sync error:', e);
      }
    }

    loadFromBackend();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');

    const previousName = getStoredSettings().storeName;
    const newName = String(storeName || '').trim() || defaultSettings.storeName;

    const payload = {
      storeName: newName,
      gstin: String(gstin || '').trim() || defaultSettings.gstin,
      defaultTaxRate: Number(defaultTaxRate) || 0,
    };

    if (previousName !== newName) {
      const entry = {
        id: Date.now(),
        from: previousName,
        to: newName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedHistory = [entry, ...nameHistory].slice(0, 10);
      setNameHistory(updatedHistory);
      try {
        localStorage.setItem(NAME_HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (err) {
        console.error('Failed to save name history:', err);
      }
    }

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save settings in localStorage:', err);
    }

    try {
      const res = await fetch(SETTINGS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const saved = data?.settings || payload;
      setStoreName(saved.storeName);
      setGstin(saved.gstin);
      setDefaultTaxRate(saved.defaultTaxRate);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
      setStatusMsg('✓ Settings Updated!');
    } catch (err) {
      console.error('Backend save error:', err);
      setStatusMsg('✓ Saved locally');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-wrapper">
      <h1 className="settings-title">Store &amp; System Settings</h1>
      <form onSubmit={handleSave} className="settings-card">
        <div className="settings-field">
          <label className="settings-label">Store / Company Name</label>
          <input
            className="settings-input"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>

        <div className="settings-grid">
          <div>
            <label className="settings-label">GSTIN Number</label>
            <input
              className="settings-input"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
            />
          </div>

          <div>
            <label className="settings-label">Default Tax Rate (%)</label>
            <input
              className="settings-input"
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(e.target.value)}
              type="number"
            />
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" disabled={saving} className="settings-btn">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          {statusMsg && <span className="settings-status">{statusMsg}</span>}
        </div>
      </form>

      {nameHistory.length > 0 && (
        <div className="settings-card" style={{ marginTop: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px' }}>
            Store Name Change History
          </h2>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
            {nameHistory.map((item) => (
              <li key={item.id} style={{ marginBottom: '6px' }}>
                <strong>{item.from}</strong> → <strong>{item.to}</strong> ({item.time})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}