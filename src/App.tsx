import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  EmailData,
  BrandConfig,
  HistoryRecord,
} from './types';
import {
  initAuth,
  googleSignIn,
  googleSignInRedirect,
  logout,
  setAccessToken,
  getAccessToken,
} from './services/auth';
import {
  sendGmailEmail,
  scheduleGmailEmail,
  sendScheduledDraftNow,
  cancelScheduledGmailEmail,
  saveGmailDraft,
} from './services/gmail';
import { requestGenerateEmail, requestRefineEmail } from './services/ai';
import { Navbar } from './components/Navbar';
import { TopicComposer } from './components/TopicComposer';
import { EmailPreviewAndEditor } from './components/EmailPreviewAndEditor';
import { BrandModal } from './components/BrandModal';
import { ConfirmSendModal } from './components/ConfirmSendModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { LoginPage } from './components/LoginPage';
import { UnauthorizedDomainModal } from './components/UnauthorizedDomainModal';
import {
  CheckCircle,
  AlertCircle,
  Sparkles,
  MailCheck,
  Send,
  Building2,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_BRAND: BrandConfig = {
  companyName: 'Ayaan Sheikh & Partners',
  tagline: 'Strategic Innovation & Enterprise Solutions',
  logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 44"><rect width="40" height="40" y="2" rx="10" fill="%231e3a8a"/><polygon points="20,10 30,30 10,30" fill="%23ffffff"/><text x="50" y="28" font-family="-apple-system, sans-serif" font-weight="bold" font-size="20" fill="%230f172a">AYAAN</text></svg>`,
  logoSize: 'medium',
  logoAlign: 'left',
  primaryColor: '#1e3a8a',
  accentColor: '#0f172a',
  templateStyle: 'executive',
  signature: {
    senderName: 'Ayaan Sheikh',
    jobTitle: 'Founder & Principal Executive',
    department: 'Strategic Operations',
    company: 'Ayaan Sheikh & Partners',
    phone: '+1 (555) 234-8901',
    website: 'https://ayaan-partners.com',
    includeDisclaimer: true,
    disclaimerText: 'This communication contains confidential information intended solely for the designated recipient. If received in error, please immediately notify the sender and delete all records.',
  },
};

const INITIAL_EMAIL_DATA: EmailData = {
  fromName: 'Ayaan Sheikh',
  fromEmail: 'Musicwithayaan@gmail.com',
  to: 'client.executive@enterprise.com',
  cc: '',
  bcc: '',
  topic: 'Follow up after our executive product strategy demo earlier today. Attach the updated enterprise proposal deck and contract pricing tier. Offer a 10% volume incentive if signed by end of week, and propose a quick 15-minute call Thursday morning to finalize next steps.',
  tone: 'executive',
  purpose: 'Meeting Follow-up',
  length: 'balanced',
  cta: 'Confirm a 15-minute sync for Thursday morning',
  language: 'English',
  subject: 'Next Steps & Enterprise Partnership Proposal — Follow-up from Today',
  alternativeSubjects: [
    'Executive Follow-up: Enterprise Proposal & Next Steps',
    'Strategy Demo Recap & Early-Bird Q3 Partnership Terms',
    'Follow-up: Proposal & Thursday Morning Sync Request',
  ],
  bodyText: `Dear Client Team,

Thank you for your valuable time during our executive demonstration earlier today. It was a pleasure sharing our latest enterprise capabilities and learning more about your strategic growth initiatives for the upcoming quarters.

As discussed, I have attached our comprehensive Enterprise Proposal Deck and the tailored Contract Pricing Schedule for your leadership review. To assist in expediting your timeline, we are pleased to extend a 10% volume incentive for agreements executed before Friday close of business.

Please review the attached documents at your earliest convenience. Could you confirm if a quick 15-minute call this Thursday at 10:00 AM works for your schedule to address any technical questions and finalize next steps?

Warm regards,
Ayaan Sheikh`,
  bodyHtml: `<p>Dear Client Team,</p>
<p>Thank you for your valuable time during our executive demonstration earlier today. It was a pleasure sharing our latest enterprise capabilities and learning more about your strategic growth initiatives for the upcoming quarters.</p>
<p>As discussed, I have attached our comprehensive <strong>Enterprise Proposal Deck</strong> and the tailored <strong>Contract Pricing Schedule</strong> for your leadership review. To assist in expediting your timeline, we are pleased to extend a <strong>10% volume incentive</strong> for agreements executed before Friday close of business.</p>
<div style="background-color: #f8fafc; border-left: 4px solid #1e3a8a; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
  <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Action Item:</strong>
  <span style="color: #475569;">Please review the attached documentation and let us know if a brief 15-minute sync this Thursday morning at 10:00 AM aligns with your calendar.</span>
</div>
<p>Looking forward to partnering with your team,</p>`,
  keyTakeaways: [
    'Acknowledged and recapped executive demonstration',
    'Included enterprise proposal and pricing schedule documents',
    'Extended 10% early execution volume incentive',
    'Requested 15-minute follow-up call on Thursday morning',
  ],
  attachments: [],
  brand: DEFAULT_BRAND,
};

export default function App() {
  const [isPortalAuthenticated, setIsPortalAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('worklyft_portal_auth') === 'authenticated' ||
        localStorage.getItem('worklyft_portal_auth') === 'authenticated'
      );
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Email form and AI generation state
  const [emailData, setEmailData] = useState<EmailData>(() => {
    try {
      const savedBrand = localStorage.getItem('executive_email_brand');
      if (savedBrand) {
        const parsed = JSON.parse(savedBrand);
        return {
          ...INITIAL_EMAIL_DATA,
          brand: { ...DEFAULT_BRAND, ...parsed },
        };
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EMAIL_DATA;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  // Modals & Drawers
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);
  const [initialScheduleMode, setInitialScheduleMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUnauthorizedDomainOpen, setIsUnauthorizedDomainOpen] = useState(false);
  const [oauthHelperTab, setOauthHelperTab] = useState<'test-users' | 'domain'>('test-users');

  // History state
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('executive_email_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Notifications
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    actionLink?: string;
  } | null>(null);

  const [gmailDraftUrl, setGmailDraftUrl] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string, actionLink?: string) => {
    setToast({ type, message, actionLink });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setTokenState(token);
        if (authedUser.email) {
          setEmailData((prev) => ({
            ...prev,
            fromEmail: authedUser.email || prev.fromEmail,
            fromName: authedUser.displayName || prev.fromName,
          }));
        }
      },
      () => {
        setUser(null);
        setTokenState(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    const record: HistoryRecord = {
      ...item,
      id: 'hist_' + Date.now(),
      timestamp: Date.now(),
    };
    const updated = [record, ...history].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem('executive_email_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Google Login Flow
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setTokenState(result.accessToken);
        if (result.user.email) {
          setEmailData((prev) => ({
            ...prev,
            fromEmail: result.user.email || prev.fromEmail,
            fromName: result.user.displayName || prev.fromName,
          }));
        }
        showToast('success', `Connected to Gmail as ${result.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      const errCode = err?.code || '';
      const errMsg = err?.message || '';
      if (
        errCode === 'auth/unauthorized-domain' ||
        errMsg.includes('auth/unauthorized-domain')
      ) {
        setOauthHelperTab('domain');
        setIsUnauthorizedDomainOpen(true);
        showToast(
          'error',
          `Add "${window.location.hostname}" to Authorized Domains in Firebase Console to enable Google Sign-In.`
        );
      } else if (
        errCode === 'auth/popup-closed-by-user' ||
        errMsg.includes('access_denied') ||
        errMsg.includes('403')
      ) {
        setOauthHelperTab('test-users');
        setIsUnauthorizedDomainOpen(true);
        showToast(
          'error',
          'If you saw "Error 403: access_denied", add your email under Test Users in Google Cloud Console.'
        );
      } else {
        showToast('error', errMsg || 'Failed to sign in with Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setTokenState(null);
    showToast('info', 'Signed out of Google Account.');
  };

  // Save Brand settings
  const handleSaveBrand = (updatedBrand: BrandConfig) => {
    setEmailData((prev) => ({ ...prev, brand: updatedBrand }));
    try {
      localStorage.setItem('executive_email_brand', JSON.stringify(updatedBrand));
    } catch (e) {
      console.error(e);
    }
    showToast('success', 'Company branding and logo updated.');
  };

  // Generate Email with Gemini AI
  const handleGenerate = async () => {
    if (!emailData.topic.trim()) {
      showToast('error', 'Please provide a topic or prompt for the email.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await requestGenerateEmail({
        topic: emailData.topic,
        senderName: emailData.fromName,
        recipientName: emailData.to,
        companyName: emailData.brand.companyName,
        companyTagline: emailData.brand.tagline,
        tone: emailData.tone,
        purpose: emailData.purpose,
        length: emailData.length,
        cta: emailData.cta,
        attachmentNames: emailData.attachments.map((a) => a.name),
        language: emailData.language,
      });

      setEmailData((prev) => ({
        ...prev,
        subject: result.subject || prev.subject,
        alternativeSubjects: result.alternativeSubjects || prev.alternativeSubjects,
        bodyText: result.bodyText || prev.bodyText,
        bodyHtml: result.bodyHtml || prev.bodyHtml,
        keyTakeaways: result.keyTakeaways || prev.keyTakeaways,
        suggestedFollowUp: result.suggestedFollowUp,
      }));

      saveToHistory({
        subject: result.subject || emailData.subject,
        to: emailData.to,
        topic: emailData.topic,
        status: 'generated',
      });

      showToast('success', 'AI crafted complete email with executive formatting!');
    } catch (err: any) {
      console.error('AI Generation error:', err);
      showToast('error', err?.message || 'Failed to generate email.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Refine Email with AI instruction
  const handleRefineWithAI = async (instruction: string) => {
    setIsRefining(true);
    try {
      const result = await requestRefineEmail({
        currentSubject: emailData.subject,
        currentBodyText: emailData.bodyText,
        currentBodyHtml: emailData.bodyHtml,
        instruction,
      });

      setEmailData((prev) => ({
        ...prev,
        subject: result.subject || prev.subject,
        bodyText: result.bodyText || prev.bodyText,
        bodyHtml: result.bodyHtml || prev.bodyHtml,
      }));

      showToast('success', result.changeSummary || 'Email refined successfully!');
    } catch (err: any) {
      console.error('Refine error:', err);
      showToast('error', err?.message || 'Failed to refine email.');
    } finally {
      setIsRefining(false);
    }
  };

  // Send or Schedule Email via Gmail API (Triggered after confirmation modal)
  const handleConfirmSendGmail = async (sendAtIso?: string) => {
    const token = await getAccessToken();
    if (!token) {
      showToast('error', 'Please connect your Google Account first.');
      setIsConfirmSendOpen(false);
      handleLogin();
      return;
    }

    if (!emailData.to.trim()) {
      showToast('error', 'Recipient email (To:) is required.');
      setIsConfirmSendOpen(false);
      return;
    }

    setIsSending(true);
    try {
      if (sendAtIso) {
        const scheduledResult = await scheduleGmailEmail({
          accessToken: token,
          fromName: emailData.fromName,
          fromEmail: emailData.fromEmail || (user?.email as string),
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
          subject: emailData.subject,
          bodyText: emailData.bodyText,
          bodyHtml: emailData.bodyHtml,
          attachments: emailData.attachments,
          brand: emailData.brand,
          sendAt: sendAtIso,
        });

        setIsConfirmSendOpen(false);
        saveToHistory({
          subject: emailData.subject,
          to: emailData.to,
          topic: emailData.topic,
          status: 'scheduled',
          gmailId: scheduledResult.jobId,
          draftId: scheduledResult.draftId,
          scheduledAt: scheduledResult.scheduledAt,
        });

        const formattedTime = new Date(sendAtIso).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });

        showToast(
          'success',
          `Email scheduled for dispatch to ${emailData.to} on ${formattedTime} via Gmail!`,
          'https://mail.google.com/mail/u/0/#drafts'
        );
      } else {
        const response = await sendGmailEmail({
          accessToken: token,
          fromName: emailData.fromName,
          fromEmail: emailData.fromEmail || (user?.email as string),
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
          subject: emailData.subject,
          bodyText: emailData.bodyText,
          bodyHtml: emailData.bodyHtml,
          attachments: emailData.attachments,
          brand: emailData.brand,
        });

        setIsConfirmSendOpen(false);
        saveToHistory({
          subject: emailData.subject,
          to: emailData.to,
          topic: emailData.topic,
          status: 'sent',
          gmailId: response.id,
        });

        showToast(
          'success',
          `Email sent successfully to ${emailData.to} via Gmail! (Message ID: ${response.id.substring(0, 8)}...)`
        );
      }
    } catch (err: any) {
      console.error('Send/schedule error:', err);
      showToast('error', err?.message || 'Failed to dispatch email via Gmail.');
    } finally {
      setIsSending(false);
    }
  };

  // Send a scheduled email immediately from History
  const handleSendScheduledNow = async (item: HistoryRecord) => {
    const token = await getAccessToken();
    if (!token || !item.draftId) {
      showToast('error', 'Please connect your Google Account to dispatch this scheduled draft.');
      return;
    }

    try {
      await sendScheduledDraftNow(token, item.draftId, item.gmailId);
      const updated = history.map((h) =>
        h.id === item.id ? { ...h, status: 'sent' as const } : h
      );
      setHistory(updated);
      localStorage.setItem('executive_email_history', JSON.stringify(updated));
      showToast('success', `Dispatched scheduled email "${item.subject}" immediately!`);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to send scheduled email.');
    }
  };

  // Cancel a scheduled email from History
  const handleCancelSchedule = async (item: HistoryRecord) => {
    const token = await getAccessToken();
    await cancelScheduledGmailEmail(token || '', item.draftId, item.gmailId);
    const updated = history.filter((h) => h.id !== item.id);
    setHistory(updated);
    localStorage.setItem('executive_email_history', JSON.stringify(updated));
    showToast('info', `Cancelled scheduled dispatch for "${item.subject}".`);
  };

  // Save to Gmail Drafts
  const handleSaveDraftToGmail = async () => {
    const token = await getAccessToken();
    if (!token) {
      showToast('error', 'Please connect your Google Account to save drafts in Gmail.');
      handleLogin();
      return;
    }

    setIsDrafting(true);
    try {
      const response = await saveGmailDraft({
        accessToken: token,
        fromName: emailData.fromName,
        fromEmail: emailData.fromEmail || (user?.email as string),
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        bodyText: emailData.bodyText,
        bodyHtml: emailData.bodyHtml,
        attachments: emailData.attachments,
        brand: emailData.brand,
      });

      const draftLink = 'https://mail.google.com/mail/u/0/#drafts';
      setGmailDraftUrl(draftLink);

      saveToHistory({
        subject: emailData.subject,
        to: emailData.to,
        topic: emailData.topic,
        status: 'drafted',
        gmailId: response.id,
      });

      showToast('success', 'Email saved to your Gmail Drafts folder!', draftLink);
    } catch (err: any) {
      console.error('Draft error:', err);
      showToast('error', err?.message || 'Failed to create Gmail draft.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handlePortalAuthenticated = (remember: boolean) => {
    setIsPortalAuthenticated(true);
    try {
      sessionStorage.setItem('worklyft_portal_auth', 'authenticated');
      if (remember) {
        localStorage.setItem('worklyft_portal_auth', 'authenticated');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLockPortal = () => {
    setIsPortalAuthenticated(false);
    try {
      sessionStorage.removeItem('worklyft_portal_auth');
      localStorage.removeItem('worklyft_portal_auth');
    } catch (e) {
      console.error(e);
    }
  };

  if (!isPortalAuthenticated) {
    return <LoginPage onAuthenticated={handlePortalAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        user={user}
        isAuthenticated={!!user && !!accessToken}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onOpenBrand={() => setIsBrandModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onLockPortal={handleLockPortal}
      />

      {/* Main App Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Toast / Notification Bar */}
        {toast && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`p-4 rounded-xl shadow-md border flex items-center justify-between gap-3 ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                )}
                <span>{toast.message}</span>
                {toast.actionLink && (
                  <a
                    href={toast.actionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    Open in Gmail <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs font-semibold px-2 py-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Split View: Composer (Left) & Preview/Editor (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Topic, Sender/Receiver, Attachments */}
          <div className="lg:col-span-5 space-y-4">
            <TopicComposer
              emailData={emailData}
              onChangeData={setEmailData}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              onOpenBrandSettings={() => setIsBrandModalOpen(true)}
              isAuthenticated={!!user && !!accessToken}
              userEmail={user?.email || undefined}
              onSignInRequired={handleLogin}
            />
          </div>

          {/* Right Column: Live Branded Preview, Direct Editor & Gmail Dispatch */}
          <div className="lg:col-span-7 h-[850px]">
            <EmailPreviewAndEditor
              emailData={emailData}
              onChangeSubject={(sub) =>
                setEmailData((prev) => ({ ...prev, subject: sub }))
              }
              onChangeBodyText={(txt, syncedHtml) =>
                setEmailData((prev) => ({
                  ...prev,
                  bodyText: txt,
                  bodyHtml: syncedHtml !== undefined ? syncedHtml : prev.bodyHtml,
                }))
              }
              onChangeBodyHtml={(html, syncedText) =>
                setEmailData((prev) => ({
                  ...prev,
                  bodyHtml: html,
                  bodyText: syncedText !== undefined ? syncedText : prev.bodyText,
                }))
              }
              onSendViaGmail={() => {
                setInitialScheduleMode(false);
                setIsConfirmSendOpen(true);
              }}
              onScheduleViaGmail={() => {
                setInitialScheduleMode(true);
                setIsConfirmSendOpen(true);
              }}
              onSaveDraftToGmail={handleSaveDraftToGmail}
              onRefineWithAI={handleRefineWithAI}
              isSending={isSending}
              isDrafting={isDrafting}
              isRefining={isRefining}
              isAuthenticated={!!user && !!accessToken}
              onSignInRequired={handleLogin}
              gmailDraftUrl={gmailDraftUrl}
            />
          </div>
        </div>
      </main>

      {/* Brand & Logo Modal */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        brand={emailData.brand}
        onSave={handleSaveBrand}
      />

      {/* Destructive Action Send Confirmation Modal (Mandatory for Workspace Integration) */}
      <ConfirmSendModal
        isOpen={isConfirmSendOpen}
        onClose={() => setIsConfirmSendOpen(false)}
        onConfirm={handleConfirmSendGmail}
        isSending={isSending}
        to={emailData.to}
        cc={emailData.cc}
        fromEmail={emailData.fromEmail || (user?.email as string) || 'Authorized Google Account'}
        subject={emailData.subject}
        attachments={emailData.attachments}
        companyName={emailData.brand.companyName}
        initialScheduleMode={initialScheduleMode}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setEmailData((prev) => ({
            ...prev,
            subject: item.subject,
            to: item.to,
            topic: item.topic || prev.topic,
          }));
          showToast('info', `Loaded "${item.subject}" from history`);
        }}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('executive_email_history');
          showToast('info', 'History cleared.');
        }}
        onCancelSchedule={handleCancelSchedule}
        onSendScheduledNow={handleSendScheduledNow}
      />

      {/* Unauthorized Domain & Test Users Setup Helper Modal */}
      <UnauthorizedDomainModal
        isOpen={isUnauthorizedDomainOpen}
        onClose={() => setIsUnauthorizedDomainOpen(false)}
        onRetrySignIn={handleLogin}
        onRedirectSignIn={() => {
          googleSignInRedirect().catch((err) => {
            showToast('error', err?.message || 'Failed to start redirect sign-in.');
          });
        }}
        initialTab={oauthHelperTab}
      />
    </div>
  );
}
