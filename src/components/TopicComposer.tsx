import React, { useState } from 'react';
import {
  EmailData,
  EmailTone,
  EmailLength,
  AttachmentItem,
} from '../types';
import { AttachmentsList } from './AttachmentsList';
import {
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Lightbulb,
  Building2,
  Mail,
  UserCheck,
} from 'lucide-react';

interface TopicComposerProps {
  emailData: EmailData;
  onChangeData: (updater: (prev: EmailData) => EmailData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onOpenBrandSettings: () => void;
  isAuthenticated: boolean;
  userEmail?: string;
  onSignInRequired: () => void;
}

const TOPIC_PRESETS = [
  {
    title: 'Client Demo Follow-Up',
    topic: 'Follow up with the prospective enterprise client after our successful product demo earlier today. Summarize key benefits, address their data security questions, include the attached feature deck and pricing document, and propose a 20-minute call this Thursday to review contract terms.',
    tone: 'executive' as EmailTone,
    cta: 'Schedule a 20-minute contract review call',
  },
  {
    title: 'Partnership Co-Marketing',
    topic: 'Propose a strategic co-marketing webinar partnership for next quarter. Highlight mutual audience overlap, explain how both brands benefit, and invite them to explore dates.',
    tone: 'persuasive' as EmailTone,
    cta: 'Confirm interest to explore dates',
  },
  {
    title: 'Executive Project Update',
    topic: 'Send monthly milestone report to executive leadership. Announce that phase 2 delivery is ahead of schedule, budget remains 5% under target, and the attached performance metrics sheet is ready for sign-off.',
    tone: 'formal' as EmailTone,
    cta: 'Review attached metrics and reply with approval',
  },
  {
    title: 'Contract Renewal & Terms',
    topic: 'Notice of annual software agreement renewal. Outline the new feature rollouts included in this tier, confirm existing locked-in rate, and provide invoice and agreement documents attached.',
    tone: 'professional' as EmailTone,
    cta: 'Sign attached agreement by end of month',
  },
  {
    title: 'Warm Appreciation & Review',
    topic: 'Thank the client for concluding a 6-month consulting engagement. Express deep gratitude to their team for collaboration, summarize key wins, and kindly ask for a testimonial or brief review.',
    tone: 'friendly' as EmailTone,
    cta: 'Leave a brief review on our portal',
  },
];

export const TopicComposer: React.FC<TopicComposerProps> = ({
  emailData,
  onChangeData,
  onGenerate,
  isGenerating,
  onOpenBrandSettings,
  isAuthenticated,
  userEmail,
  onSignInRequired,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const applyPreset = (preset: (typeof TOPIC_PRESETS)[0]) => {
    onChangeData((prev) => ({
      ...prev,
      topic: preset.topic,
      tone: preset.tone,
      cta: preset.cta,
    }));
  };

  const handleAddAttachments = (newFiles: AttachmentItem[]) => {
    onChangeData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles],
    }));
  };

  const handleRemoveAttachment = (id: string) => {
    onChangeData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Sender & Receiver Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Sender &amp; Recipient Emails
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowCcBcc(!showCcBcc)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {showCcBcc ? 'Hide Cc/Bcc' : '+ Add Cc / Bcc'}
          </button>
        </div>

        {/* Sender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              From (Sender Email)
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailData.fromEmail}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeData((prev) => ({ ...prev, fromEmail: val }));
                }}
                placeholder={userEmail || 'sender@company.com'}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-white"
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sender Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={emailData.fromName}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeData((prev) => ({ ...prev, fromName: val }));
                }}
                placeholder="e.g. Ayaan Sheikh"
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Recipient Row */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            To (Recipient Email) <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={emailData.to}
            onChange={(e) => {
              const val = e.target.value;
              onChangeData((prev) => ({ ...prev, to: val }));
            }}
            placeholder="e.g. client.executive@enterprise.com"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white font-medium"
          />
        </div>

        {/* Optional Cc / Bcc */}
        {showCcBcc && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Cc (Carbon Copy)
              </label>
              <input
                type="text"
                value={emailData.cc}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeData((prev) => ({ ...prev, cc: val }));
                }}
                placeholder="colleague@company.com"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Bcc (Blind Copy)
              </label>
              <input
                type="text"
                value={emailData.bcc}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeData((prev) => ({ ...prev, bcc: val }));
                }}
                placeholder="archive@company.com"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Email Topic Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            What is the Topic or Goal of this Email?
          </label>
          <span className="text-[11px] text-slate-400">
            Just describe the intent; AI writes the rest
          </span>
        </div>

        <textarea
          rows={4}
          value={emailData.topic}
          onChange={(e) => {
            const val = e.target.value;
            onChangeData((prev) => ({ ...prev, topic: val }));
          }}
          placeholder="e.g. Follow up with client regarding yesterday's presentation, attach the updated proposal, provide a 10% early bird incentive if confirmed by Friday, and ask for a 15-minute call."
          className="w-full p-3.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 placeholder-slate-400 leading-relaxed"
        />

        {/* Quick Inspiration Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Quick Topic Starters:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TOPIC_PRESETS.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => applyPreset(item)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document Attachments Section */}
      <AttachmentsList
        attachments={emailData.attachments}
        onAddAttachments={handleAddAttachments}
        onRemoveAttachment={handleRemoveAttachment}
      />

      {/* Advanced AI Tuning Accordion */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Tone, Style &amp; Customization Settings</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] capitalize">{emailData.tone} tone &bull; {emailData.length} length</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-4 pt-2 border-t border-slate-200 bg-white space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tone */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tone of Voice
                </label>
                <select
                  value={emailData.tone}
                  onChange={(e) => {
                    const val = e.target.value as EmailTone;
                    onChangeData((prev) => ({ ...prev, tone: val }));
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="executive">Executive &amp; Authoritative</option>
                  <option value="formal">Formal &amp; Direct</option>
                  <option value="friendly">Warm &amp; Conversational</option>
                  <option value="persuasive">Persuasive &amp; Sales-Oriented</option>
                  <option value="urgent">Urgent &amp; Time-Sensitive</option>
                </select>
              </div>

              {/* Length */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Target Length
                </label>
                <select
                  value={emailData.length}
                  onChange={(e) => {
                    const val = e.target.value as EmailLength;
                    onChangeData((prev) => ({ ...prev, length: val }));
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="concise">Concise (1-2 crisp paragraphs)</option>
                  <option value="balanced">Balanced (2-3 structured paragraphs)</option>
                  <option value="detailed">Comprehensive (In-depth breakdown)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Language
                </label>
                <select
                  value={emailData.language}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChangeData((prev) => ({ ...prev, language: val }));
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Italian">Italian (Italiano)</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Japanese">Japanese (日本語)</option>
                </select>
              </div>
            </div>

            {/* Explicit Call to Action */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Specific Call to Action (CTA)
              </label>
              <input
                type="text"
                value={emailData.cta}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeData((prev) => ({ ...prev, cta: val }));
                }}
                placeholder="e.g. Schedule a 15-minute call, Review attached PDF, Reply with availability"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Brand & Generate Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenBrandSettings}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Branding: {emailData.brand.companyName || 'Set Company Logo'}</span>
        </button>

        <button
          type="button"
          disabled={isGenerating || !emailData.topic.trim()}
          onClick={onGenerate}
          className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI Writing Complete Email...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Generate Complete Email with AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
