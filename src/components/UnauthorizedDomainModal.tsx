import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Globe,
  UserPlus,
  Users,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrySignIn: () => void;
  onRedirectSignIn?: () => void;
  initialTab?: 'test-users' | 'domain';
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  onClose,
  onRetrySignIn,
  onRedirectSignIn,
  initialTab = 'test-users',
}) => {
  const [activeTab, setActiveTab] = useState<'test-users' | 'domain'>(initialTab);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const currentDomain =
    typeof window !== 'undefined' ? window.location.hostname : 'your-app.vercel.app';
  const projectId = firebaseConfig.projectId || 'gen-lang-client-0828994048';
  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;
  const gcpConsentScreenUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;
  const gcpAudienceUrl = `https://console.cloud.google.com/auth/audience?project=${projectId}`;

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('worklyft.business@gmail.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Google OAuth Access &amp; Domain Setup
              </h3>
              <p className="text-xs text-slate-500">
                Project ID: <span className="font-mono font-semibold text-slate-700">{projectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('test-users')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'test-users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Fix Error 403: Access Denied (Test Users)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'domain'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Authorize Vercel Domain</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          {activeTab === 'test-users' ? (
            <>
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <strong>Why Error 403 happens:</strong> Your Google Cloud OAuth Consent Screen is currently in <strong>Testing</strong> mode, which only allows approved test emails to sign in.
              </div>

              {/* Option A: Add Test User */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Option 1: Add worklyft.business@gmail.com as a Test User
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
                  <code className="font-mono font-semibold text-slate-900 truncate">
                    worklyft.business@gmail.com
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>
                    Open the <strong>Google OAuth Audience / Consent Screen</strong> using the button below.
                  </li>
                  <li>
                    Scroll down to the <strong>Test users</strong> section and click <strong>+ Add Users</strong>.
                  </li>
                  <li>
                    Paste <code className="font-mono font-semibold text-slate-900">worklyft.business@gmail.com</code> (and any other team emails) and click <strong>Save</strong>.
                  </li>
                </ol>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={gcpAudienceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    <span>Open Google Auth Audience (Test Users)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={gcpConsentScreenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg transition-colors"
                  >
                    <span>Classic Consent Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Option B: Publish App */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Option 2: Allow Any Gmail Account (Publish App)
                </span>
                <p className="text-slate-600">
                  On the same OAuth Audience page under <strong>Publishing status</strong>, click <strong>Publish App</strong> and confirm. Any Google account can then sign in (click <em>Advanced &rarr; Go to {projectId}.firebaseapp.com (unsafe)</em> on the first sign-in).
                </p>
              </div>
            </>
          ) : (
            <>
              <p>
                Ensure your deployment domain is listed under <strong>Authorized domains</strong> in Firebase Authentication.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1. Copy your current deployment domain
                </span>
                <div className="flex items-center justify-between gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                    <code className="font-mono font-semibold text-slate-900 truncate">
                      {currentDomain}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Domain</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  2. Add domain in Firebase Console
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>
                    Open your project (<code className="font-mono text-slate-800">{projectId}</code>) in the Firebase Console.
                  </li>
                  <li>
                    Go to <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized domains</strong>.
                  </li>
                  <li>
                    Click <strong>Add domain</strong>, paste <code className="font-mono font-semibold text-slate-900">{currentDomain}</code>, and click <strong>Add</strong>.
                  </li>
                </ol>

                <a
                  href={firebaseAuthSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <span>Open Firebase Auth Settings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          {onRedirectSignIn ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRedirectSignIn();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              Sign In via Same-Tab Redirect (No Popup)
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRetrySignIn();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Retry Popup Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
