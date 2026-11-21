import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Package } from 'lucide-react';

const Page1_Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center w-full">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Package className="text-blue-600 w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold text-slate-800">SmartStock ERP</h1>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@smartstock.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
            {loading ? 'Signing in...' : 'Sign In'}

          </button>
        </form>
      </div>
    </div>
  );
};

export default Page1_Login;