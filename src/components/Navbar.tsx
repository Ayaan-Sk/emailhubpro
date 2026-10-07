import React from 'react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Mail, Building2, Clock, LogOut, CheckCircle2, Lock } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenBrand: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onLockPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isAuthenticated,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenBrand,
  onOpenHistory,
  historyCount,
  onLockPortal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Executive Email AI
              </h1>
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                · admin@worklyft.in
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Generate branded emails from topics, attach documents &amp; dispatch via Gmail
            </p>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Brand Settings */}
          <button
            type="button"
            onClick={onOpenBrand}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Company Logo & Branding"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Company Branding</span>
          </button>

          {/* History Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="History"
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="text-xs text-blue-600 font-bold">
                · {historyCount}
              </span>
            )}
          </button>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="flex items-center gap-2 py-1 px-2 bg-slate-50 rounded-xl border border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-[11px] font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Gmail Linked</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                title="Disconnect Google Account"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pl-1 border-l border-slate-200">
              <GoogleSignInButton onClick={onLogin} isLoading={isLoggingIn} />
            </div>
          )}

          {onLockPortal && (
            <button
              type="button"
              onClick={onLockPortal}
              title="Lock Software / Sign Out of Worklyft Portal"
              className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Lock</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
