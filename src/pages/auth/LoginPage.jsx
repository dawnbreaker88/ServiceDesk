import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Lock, Mail, AlertCircle, ArrowRight, Sun, Moon } from 'lucide-react';

export default function LoginPage({ onBackToLanding }) {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#09090b] text-[#171717] dark:text-[#f4f4f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-grid-pattern transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-[13px] text-[#737373] dark:text-[#a1a1aa] hover:text-[#0a0a0a] dark:hover:text-[#f4f4f5] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Landing Page</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-[8px] text-[#737373] dark:text-[#a1a1aa] hover:text-[#0a0a0a] dark:hover:text-[#f4f4f5] hover:bg-[#f5f5f5] dark:hover:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] transition-all cursor-pointer shadow-2xs"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        <div className="flex items-center gap-3 justify-center mb-4">
          <img
            src="/favicon.svg"
            alt="ServiceDesk Logo"
            className="w-9 h-9 object-contain rounded-md"
          />
          <span className="font-display font-bold text-2xl tracking-tight text-[#0a0a0a] dark:text-[#f4f4f5]">
            ServiceDesk<span className="text-[#2563eb]">.</span>
          </span>
        </div>
        <h2 className="text-center font-display font-medium text-2xl text-[#0a0a0a] dark:text-[#f4f4f5] tracking-tight">
          Sign in to your workspace
        </h2>
        <p className="mt-2 text-center text-[14px] text-[#737373] dark:text-[#a1a1aa]">
          Enter your organization credentials to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#ffffff] dark:bg-[#121215] py-8 px-6 sm:px-8 border border-[#e5e5e5] dark:border-[#27272a] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-none">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-[8px] flex items-center gap-2 text-[13px] text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#171717] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#171717] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[8px] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Instant Testing */}
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] text-center mb-3">
              One-Click Role Demonstration
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('emp.prabhath@servicedesk.com');
                  setPassword('Password123!');
                }}
                className="p-2 text-left bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[8px] text-[12px] transition-all"
              >
                <div className="font-semibold text-[#0a0a0a]">👤 Employee (Prabhath)</div>
                <div className="text-[10px] text-[#737373] truncate">emp.prabhath@servicedesk.com</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('tech.rahul@servicedesk.com');
                  setPassword('Password123!');
                }}
                className="p-2 text-left bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[8px] text-[12px] transition-all"
              >
                <div className="font-semibold text-[#0a0a0a]">🛠️ Senior Tech (Rahul)</div>
                <div className="text-[10px] text-[#737373] truncate">tech.rahul@servicedesk.com</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('manager@servicedesk.com');
                  setPassword('Password123!');
                }}
                className="p-2 text-left bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[8px] text-[12px] transition-all"
              >
                <div className="font-semibold text-[#0a0a0a]">📊 IT Manager (Elena)</div>
                <div className="text-[10px] text-[#737373] truncate">manager@servicedesk.com</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('admin@servicedesk.com');
                  setPassword('Password123!');
                }}
                className="p-2 text-left bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[8px] text-[12px] transition-all"
              >
                <div className="font-semibold text-[#0a0a0a]">⚙️ System Admin (Alex)</div>
                <div className="text-[10px] text-[#737373] truncate">admin@servicedesk.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
