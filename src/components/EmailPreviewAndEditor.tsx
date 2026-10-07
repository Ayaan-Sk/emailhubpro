import React, { useState, useRef } from 'react';
import { EmailData } from '../types';
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
  PenLine,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  FileText,
} from 'lucide-react';

interface EmailPreviewAndEditorProps {
  emailData: EmailData;
  onChangeSubject: (newSubject: string) => void;
  onChangeBodyText: (newBodyText: string, syncedHtml?: string) => void;
  onChangeBodyHtml?: (newBodyHtml: string, syncedText?: string) => void;
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
  {
    label: 'Make Shorter',
    instruction:
      'Make the email more concise and cut any unnecessary filler while keeping key actions.',
  },
  {
    label: 'More Formal',
    instruction:
      'Rewrite in an executive, dignified, and highly polished corporate tone.',
  },
  {
    label: 'Warmer & Friendly',
    instruction:
      'Make the tone warmer, conversational, and genuinely appreciative.',
  },
  {
    label: 'Add Urgency',
    instruction:
      'Politely emphasize a tight timeline and prompt the recipient to respond soon.',
  },
  {
    label: 'Executive Bullet Points',
    instruction:
      'Format the main project takeaways into crisp, clean bullet points.',
  },
];

// Converts plain text paragraphs & bullet points into clean semantic HTML for the branded email template
export function convertPlainTextToHtml(text: string): string {
  const blocks = text.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      const lines = trimmed.split('\n');
      const isBulletList = lines.every((l) => /^[-*•]\s+/.test(l.trim()));
      if (isBulletList) {
        const items = lines
          .map((l) => `<li>${l.trim().replace(/^[-*•]\s+/, '')}</li>`)
          .join('');
        return `<ul style="padding-left: 20px; margin: 12px 0;">${items}</ul>`;
      }
      return `<p style="margin: 0 0 14px 0;">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

// Strips HTML tags to produce clean plain-text representation
export function convertHtmlToPlainText(html: string): string {
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]+>/g, '');
  }
  const temp = document.createElement('div');
  temp.innerHTML = html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n');
  return (temp.textContent || temp.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
}

export const EmailPreviewAndEditor: React.FC<EmailPreviewAndEditorProps> = ({
  emailData,
  onChangeSubject,
  onChangeBodyText,
  onChangeBodyHtml,
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
  const [viewMode, setViewMode] = useState<'preview' | 'rich' | 'text' | 'html'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedType, setCopiedType] = useState<'html' | 'text' | null>(null);
  const [customRefineText, setCustomRefineText] = useState('');
  const [showCustomRefine, setShowCustomRefine] = useState(false);

  const richEditorRef = useRef<HTMLDivElement>(null);

  const fullHtml = buildCompleteEmailHtml(
    emailData.bodyHtml || convertPlainTextToHtml(emailData.bodyText),
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

  const handlePlainTextEdit = (newText: string) => {
    const syncedHtml = convertPlainTextToHtml(newText);
    onChangeBodyText(newText, syncedHtml);
  };

  const handleHtmlSourceEdit = (newHtml: string) => {
    const syncedText = convertHtmlToPlainText(newHtml);
    if (onChangeBodyHtml) {
      onChangeBodyHtml(newHtml, syncedText);
    } else {
      onChangeBodyText(syncedText, newHtml);
    }
  };

  const execFormatCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (richEditorRef.current) {
      const updatedHtml = richEditorRef.current.innerHTML;
      handleHtmlSourceEdit(updatedHtml);
    }
  };

  const insertCalloutBox = () => {
    const calloutHtml = `<div style="background-color: #f8fafc; border-left: 4px solid ${emailData.brand.primaryColor}; padding: 12px 16px; margin: 16px 0; border-radius: 4px;"><strong>Key Highlight:</strong> Enter your important note or action item here.</div><p><br/></p>`;
    document.execCommand('insertHTML', false, calloutHtml);
    if (richEditorRef.current) {
      handleHtmlSourceEdit(richEditorRef.current.innerHTML);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-3 border-b border-slate-200 bg-slate-50/80">
        {/* View & Edit mode segmented toggle */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('text')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'text'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenLine className="w-3.5 h-3.5 text-blue-600" />
            <span>Manual Text Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('rich')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'rich'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Rich Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'html'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">HTML</span>
          </button>
        </div>

        {/* Device Switcher (in preview mode) */}
        {viewMode === 'preview' && (
          <div className="hidden md:flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs">
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
        <div className="flex items-center gap-1.5">
          {viewMode === 'preview' && (
            <button
              type="button"
              onClick={() => setViewMode('text')}
              className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Edit Manually</span>
            </button>
          )}
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
            <span>{copiedType === 'html' ? 'Copied' : 'HTML'}</span>
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
            <span>{copiedType === 'text' ? 'Copied' : 'Text'}</span>
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
            placeholder="Type or edit email subject line..."
            className="flex-1 font-semibold text-slate-900 text-sm border border-transparent hover:border-slate-300 focus:border-blue-600 rounded-lg focus:outline-hidden py-1 px-2 transition-colors bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Alternative AI Subject lines */}
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
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-xs truncate max-w-[240px] transition-all cursor-pointer shrink-0"
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
          <div className="flex items-center gap-1 text-blue-700 font-medium text-xs">
            <Paperclip className="w-3.5 h-3.5" />
            <span>
              {emailData.attachments.length} attached{' '}
              {emailData.attachments.length === 1 ? 'document' : 'documents'}
            </span>
          </div>
        )}
      </div>

      {/* Main Email Body Viewer or Manual Editors */}
      <div className="flex-1 overflow-y-auto bg-slate-100/70 p-4 flex justify-center">
        {viewMode === 'preview' && (
          <div
            className={`transition-all duration-200 shadow-md rounded-xl overflow-hidden bg-white w-full ${
              deviceMode === 'mobile' ? 'max-w-[390px] my-2' : 'max-w-[700px]'
            }`}
          >
            <iframe
              title="Email Render"
              srcDoc={fullHtml}
              className="w-full min-h-[500px] border-0"
              style={{ minHeight: deviceMode === 'mobile' ? '560px' : '520px' }}
            />
          </div>
        )}

        {viewMode === 'text' && (
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5 text-blue-600" />
                  Manual Email Content Editor
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type or edit your email directly below. All changes automatically sync to the branded visual template and Gmail dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Done &amp; View Preview
              </button>
            </div>
            <textarea
              rows={17}
              value={emailData.bodyText}
              onChange={(e) => handlePlainTextEdit(e.target.value)}
              placeholder="Write or edit your complete email message here..."
              className="w-full flex-1 p-4 border border-slate-300 rounded-xl text-sm text-slate-900 leading-relaxed font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden bg-slate-50/30"
            />
          </div>
        )}

        {viewMode === 'rich' && (
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => execFormatCommand('bold')}
                  className="p-1.5 hover:bg-white rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execFormatCommand('italic')}
                  className="p-1.5 hover:bg-white rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execFormatCommand('underline')}
                  className="p-1.5 hover:bg-white rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => execFormatCommand('insertUnorderedList')}
                  className="p-1.5 hover:bg-white rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execFormatCommand('insertOrderedList')}
                  className="p-1.5 hover:bg-white rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={insertCalloutBox}
                  className="px-2 py-1 hover:bg-white rounded text-xs font-semibold text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Insert Highlight Callout Box"
                >
                  <Quote className="w-3.5 h-3.5" />
                  <span>+ Callout Box</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                View Branded Preview
              </button>
            </div>

            <div
              ref={richEditorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const updatedHtml = (e.currentTarget as HTMLDivElement).innerHTML;
                handleHtmlSourceEdit(updatedHtml);
              }}
              dangerouslySetInnerHTML={{
                __html:
                  emailData.bodyHtml || convertPlainTextToHtml(emailData.bodyText),
              }}
              className="w-full flex-1 min-h-[380px] p-4 border border-slate-300 rounded-xl text-sm text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden overflow-y-auto prose max-w-none"
            />
          </div>
        )}

        {viewMode === 'html' && (
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-blue-600" />
                  HTML Body Source Editor
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Edit the inner HTML content directly. Your company logo, header, and signature wrap this content automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                View Branded Preview
              </button>
            </div>
            <textarea
              rows={17}
              value={emailData.bodyHtml || convertPlainTextToHtml(emailData.bodyText)}
              onChange={(e) => handleHtmlSourceEdit(e.target.value)}
              placeholder="<p>Write custom HTML email content...</p>"
              className="w-full flex-1 p-4 border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50"
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
