import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageProps {
  onAuthenticated: (remember: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = userId.trim().toLowerCase();
    if (!trimmedId || !password) {
      setError('Please enter both your Workspace ID and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trimmedId, password }),
      });

      if (res.ok) {
        onAuthenticated(rememberMe);
        return;
      }

      // If hosted on a static environment where /api/auth/login returns 404/405, verify directly
      if (res.status === 404 || res.status === 405) {
        if (trimmedId === 'admin@worklyft.in' && password === 'worklyft8080') {
          onAuthenticated(rememberMe);
          return;
        }
        setError('Invalid Workspace ID or password. Access denied.');
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Invalid Workspace ID or password. Access denied.');
    } catch {
      // Fallback verification if offline/client-only check is needed
      if (trimmedId === 'admin@worklyft.in' && password === 'worklyft8080') {
        onAuthenticated(rememberMe);
      } else {
        setError('Invalid Workspace ID or password. Access denied.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Brand & Security Column */}
        <div className="md:col-span-5 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Worklyft Executive Mail
                </h1>
                <p className="text-xs text-slate-400">
                  Enterprise Dispatch &amp; AI Suite
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-bold text-white leading-snug">
                Authorized Workspace Access Only
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with your administrator credentials to compose branded executive correspondence, attach confidential documents, and schedule dispatches via Gmail.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>AI Topic-to-Email Executive Drafting</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Custom Corporate Branding &amp; Signatures</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Direct &amp; Scheduled Send-At via Gmail API</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Protected by Worklyft Access Control</span>
          </div>
        </div>

        {/* Right Sign-In Form Column */}
        <div className="md:col-span-7 bg-white text-slate-900 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Administrator Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your Worklyft administrator ID and password to unlock the software.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="portal-user-id"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Administrator ID
                </label>
                <div className="relative">
                  <input
                    id="portal-user-id"
                    type="email"
                    autoComplete="username"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="admin@worklyft.in"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden text-slate-900 placeholder-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="portal-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="portal-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter access password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden text-slate-900 placeholder-slate-400"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Keep session signed in
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Software</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
