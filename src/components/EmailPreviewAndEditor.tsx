import React, { useState } from 'react';
import {
  EmailData,
  AttachmentItem,
} from '../types';
import { buildCompleteEmailHtml } from '../utils/templateBuilder';
import {
  Send,
  Save,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Sparkles,
  Paperclip,
  Code,
  Eye,
  RefreshCw,
  ExternalLink,
  CalendarClock,
} from 'lucide-react';

interface EmailPreviewAndEditorProps {
  emailData: EmailData;
  onChangeSubject: (newSubject: string) => void;
  onChangeBodyText: (newBodyText: string) => void;
  onSendViaGmail: () => void;
  onScheduleViaGmail?: () => void;
  onSaveDraftToGmail: () => void;
  onRefineWithAI: (instruction: string) => Promise<void>;
  isSending: boolean;
  isDrafting: boolean;
  isRefining: boolean;
  isAuthenticated: boolean;
  onSignInRequired: () => void;
  gmailDraftUrl?: string | null;
}

const QUICK_REFINEMENTS = [
  { label: 'Make Shorter', instruction: 'Make the email more concise and cut any unnecessary filler while keeping key actions.' },
  { label: 'More Formal', instruction: 'Rewrite in an executive, dignified, and highly polished corporate tone.' },
  { label: 'Warmer & Friendly', instruction: 'Make the tone warmer, conversational, and genuinely appreciative.' },
  { label: 'Add Urgency', instruction: 'Politely emphasize a tight timeline and prompt the recipient to respond soon.' },
  { label: 'Executive Bullet Points', instruction: 'Format the main project takeaways into crisp, clean bullet points.' },
];

export const EmailPreviewAndEditor: React.FC<EmailPreviewAndEditorProps> = ({
  emailData,
  onChangeSubject,
  onChangeBodyText,
  onSendViaGmail,
  onScheduleViaGmail,
  onSaveDraftToGmail,
  onRefineWithAI,
  isSending,
  isDrafting,
  isRefining,
  isAuthenticated,
  onSignInRequired,
  gmailDraftUrl,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedType, setCopiedType] = useState<'html' | 'text' | null>(null);
  const [customRefineText, setCustomRefineText] = useState('');
  const [showCustomRefine, setShowCustomRefine] = useState(false);

  const fullHtml = buildCompleteEmailHtml(
    emailData.bodyHtml || `<p>${emailData.bodyText.replace(/\n/g, '<br/>')}</p>`,
    emailData.brand,
    emailData.to
  );

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(fullHtml);
      setCopiedType('html');
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${emailData.subject}\n\n${emailData.bodyText}`
      );
      setCopiedType('text');
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendClick = () => {
    if (!isAuthenticated) {
      onSignInRequired();
      return;
    }
    onSendViaGmail();
  };

  const handleScheduleClick = () => {
    if (!isAuthenticated) {
      onSignInRequired();
      return;
    }
    if (onScheduleViaGmail) {
      onScheduleViaGmail();
    } else {
      onSendViaGmail();
    }
  };

  const handleDraftClick = () => {
    if (!isAuthenticated) {
      onSignInRequired();
      return;
    }
    onSaveDraftToGmail();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/80">
        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Visual Preview
          </button>
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-slate-600" />
            Edit Content
          </button>
        </div>

        {/* Device Switcher (in preview mode) */}
        {viewMode === 'preview' && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick action copies */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyHtml}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="Copy formatted HTML"
          >
            {copiedType === 'html' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedType === 'html' ? 'Copied HTML!' : 'Copy HTML'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="Copy plain text"
          >
            {copiedType === 'text' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedType === 'text' ? 'Copied Text!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Subject Line & Alternatives */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-16 shrink-0">
            Subject:
          </span>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => onChangeSubject(e.target.value)}
            placeholder="Email subject..."
            className="flex-1 font-semibold text-slate-900 text-sm border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-hidden py-1 px-1 transition-colors"
          />
        </div>

        {/* Alternative AI Subject lines pills */}
        {emailData.alternativeSubjects && emailData.alternativeSubjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              AI Variations:
            </span>
            {emailData.alternativeSubjects.map((sub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeSubject(sub)}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-xs truncate max-w-[240px] transition-all cursor-pointer shrink-0"
                title={`Click to adopt: ${sub}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Bar (Sender, Recipient, Attachments Count) */}
      <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-slate-400 font-medium">To: </span>
            <span className="font-semibold text-slate-800">
              {emailData.to || <span className="italic text-slate-400">Not specified yet</span>}
            </span>
          </div>
          {emailData.cc && (
            <div>
              <span className="text-slate-400 font-medium">Cc: </span>
              <span className="text-slate-700">{emailData.cc}</span>
            </div>
          )}
          <div>
            <span className="text-slate-400 font-medium">From: </span>
            <span className="text-slate-700 font-mono text-[11px]">
              {emailData.fromEmail || 'Default Account'}
            </span>
          </div>
        </div>

        {emailData.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium text-xs">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{emailData.attachments.length} attached {emailData.attachments.length === 1 ? 'document' : 'documents'}</span>
          </div>
        )}
      </div>

      {/* Main Email Body Viewer or Editor */}
      <div className="flex-1 overflow-y-auto bg-slate-100/70 p-4 flex justify-center">
        {viewMode === 'preview' ? (
          <div
            className={`transition-all duration-200 shadow-md rounded-xl overflow-hidden bg-white w-full ${
              deviceMode === 'mobile' ? 'max-w-[390px] my-2' : 'max-w-[700px]'
            }`}
          >
            {/* Embedded HTML frame simulation */}
            <iframe
              title="Email Render"
              srcDoc={fullHtml}
              className="w-full min-h-[500px] border-0"
              style={{ minHeight: deviceMode === 'mobile' ? '560px' : '520px' }}
            />
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Direct Body Text Editor
              </label>
              <span className="text-xs text-slate-400">
                Supports line breaks and paragraphs
              </span>
            </div>
            <textarea
              rows={16}
              value={emailData.bodyText}
              onChange={(e) => onChangeBodyText(e.target.value)}
              placeholder="Email content goes here..."
              className="w-full flex-1 p-4 border border-slate-200 rounded-lg text-sm text-slate-800 leading-relaxed font-sans focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* AI Polish Toolbar */}
      <div className="px-5 py-2.5 border-t border-slate-200 bg-white flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI Refine:</span>
        </div>

        {QUICK_REFINEMENTS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            disabled={isRefining}
            onClick={() => onRefineWithAI(btn.instruction)}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {btn.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowCustomRefine(!showCustomRefine)}
          className="text-xs font-medium text-blue-600 hover:underline ml-auto cursor-pointer"
        >
          {showCustomRefine ? 'Close Custom' : '+ Custom Prompt'}
        </button>
      </div>

      {/* Custom Refinement Input Bar */}
      {showCustomRefine && (
        <div className="px-5 py-2.5 bg-blue-50/50 border-t border-blue-100 flex items-center gap-2">
          <input
            type="text"
            value={customRefineText}
            onChange={(e) => setCustomRefineText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customRefineText.trim()) {
                onRefineWithAI(customRefineText.trim());
                setCustomRefineText('');
                setShowCustomRefine(false);
              }
            }}
            placeholder="e.g. 'Add a paragraph inviting them to a coffee chat next Tuesday'..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <button
            type="button"
            disabled={isRefining || !customRefineText.trim()}
            onClick={() => {
              if (customRefineText.trim()) {
                onRefineWithAI(customRefineText.trim());
                setCustomRefineText('');
                setShowCustomRefine(false);
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {/* Bottom Dispatch Actions */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {gmailDraftUrl && (
            <a
              href={gmailDraftUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
            >
              <span>Draft saved in Gmail</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Save to Gmail Drafts */}
          <button
            type="button"
            disabled={isDrafting || isSending}
            onClick={handleDraftClick}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isDrafting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>Save Draft</span>
          </button>

          {/* Schedule Send via Gmail */}
          <button
            type="button"
            disabled={isSending || isDrafting}
            onClick={handleScheduleClick}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Schedule Send</span>
          </button>

          {/* Send via Gmail */}
          <button
            type="button"
            disabled={isSending || isDrafting}
            onClick={handleSendClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSending ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Send via Gmail</span>
          </button>
        </div>
      </div>
    </div>
  );
};
