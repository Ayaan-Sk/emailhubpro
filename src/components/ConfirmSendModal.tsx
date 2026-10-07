import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  AlertTriangle,
  Paperclip,
  Mail,
  ShieldCheck,
  CalendarClock,
  Clock,
} from 'lucide-react';
import { AttachmentItem } from '../types';
import { DateTimePicker } from './DateTimePicker';

interface ConfirmSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sendAtIso?: string) => void;
  isSending: boolean;
  to: string;
  cc?: string;
  fromEmail: string;
  subject: string;
  attachments: AttachmentItem[];
  companyName: string;
  initialScheduleMode?: boolean;
}

function getDefaultScheduleDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export const ConfirmSendModal: React.FC<ConfirmSendModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSending,
  to,
  cc,
  fromEmail,
  subject,
  attachments,
  companyName,
  initialScheduleMode = false,
}) => {
  const [dispatchMode, setDispatchMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date>(getDefaultScheduleDate);

  useEffect(() => {
    if (isOpen) {
      setDispatchMode(initialScheduleMode ? 'schedule' : 'now');
      setScheduledDate(getDefaultScheduleDate());
    }
  }, [isOpen, initialScheduleMode]);

  if (!isOpen) return null;

  const isScheduleInvalid =
    dispatchMode === 'schedule' && scheduledDate.getTime() <= Date.now();

  const handleConfirmClick = () => {
    if (dispatchMode === 'schedule') {
      if (isScheduleInvalid) return;
      onConfirm(scheduledDate.toISOString());
    } else {
      onConfirm(undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              {dispatchMode === 'schedule' ? (
                <CalendarClock className="w-5 h-5" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {dispatchMode === 'schedule'
                  ? 'Schedule Email Dispatch via Gmail'
                  : 'Confirm Sending via Gmail'}
              </h3>
              <p className="text-xs text-slate-500">
                Authorized action through your Google Workspace account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Segmented Dispatch Timing Toggle */}
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Delivery Timing
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setDispatchMode('now')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  dispatchMode === 'now'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Send Immediately</span>
              </button>
              <button
                type="button"
                onClick={() => setDispatchMode('schedule')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  dispatchMode === 'schedule'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                <span>Schedule for Later (Send-At)</span>
              </button>
            </div>
          </div>

          {/* Interactive Date & Time Picker when scheduling */}
          {dispatchMode === 'schedule' && (
            <DateTimePicker
              value={scheduledDate}
              onChange={(newDate) => setScheduledDate(newDate)}
            />
          )}

          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl flex items-start gap-3 border ${
              dispatchMode === 'schedule'
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}
          >
            {dispatchMode === 'schedule' ? (
              <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              {dispatchMode === 'schedule' ? (
                <>
                  <span className="font-semibold block mb-0.5">
                    Scheduled Send-At Dispatch:{" "}
                    {scheduledDate.toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  This email will be staged in your Gmail account (<span className="font-medium underline">{fromEmail}</span>) with the scheduled timestamp and automatically dispatched at the designated time.
                </>
              ) : (
                <>
                  <span className="font-semibold block mb-0.5">Ready to dispatch email</span>
                  This action will deliver the formatted email immediately from your Gmail address (<span className="font-medium underline">{fromEmail}</span>) to the designated recipient.
                </>
              )}
            </div>
          </div>

          {/* Summary Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-baseline">
              <span className="w-20 font-semibold uppercase text-slate-500 text-[10px] shrink-0">Recipient:</span>
              <span className="font-medium text-slate-900 break-all">{to || '(No recipient)'}</span>
            </div>
            {cc && (
              <div className="flex items-baseline">
                <span className="w-20 font-semibold uppercase text-slate-500 text-[10px] shrink-0">Cc:</span>
                <span className="font-medium text-slate-700 break-all">{cc}</span>
              </div>
            )}
            <div className="flex items-baseline">
              <span className="w-20 font-semibold uppercase text-slate-500 text-[10px] shrink-0">Subject:</span>
              <span className="font-medium text-slate-900">{subject || '(No subject)'}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-20 font-semibold uppercase text-slate-500 text-[10px] shrink-0">Branding:</span>
              <span className="text-slate-700">{companyName || 'Standard corporate branding'}</span>
            </div>
            {attachments.length > 0 && (
              <div className="flex items-start pt-1.5 border-t border-slate-200">
                <span className="w-20 font-semibold uppercase text-slate-500 text-[10px] pt-0.5 shrink-0">Files:</span>
                <div className="space-y-1 flex-1">
                  {attachments.map((file) => (
                    <div key={file.id} className="flex items-center gap-1.5 text-slate-700">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[280px]">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with OAuth2 Bearer token</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={isSending || isScheduleInvalid}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{dispatchMode === 'schedule' ? 'Scheduling...' : 'Dispatching...'}</span>
                </>
              ) : dispatchMode === 'schedule' ? (
                <>
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Schedule Send</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Send Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
