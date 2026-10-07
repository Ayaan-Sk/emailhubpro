import React from 'react';
import { HistoryRecord } from '../types';
import {
  X,
  Clock,
  CheckCircle2,
  FileEdit,
  ArrowUpRight,
  Trash2,
  Mail,
  CalendarClock,
  Send,
  XCircle,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  onSelect: (item: HistoryRecord) => void;
  onClear: () => void;
  onCancelSchedule?: (item: HistoryRecord) => void;
  onSendScheduledNow?: (item: HistoryRecord) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onCancelSchedule,
  onSendScheduledNow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">Email Dispatch History</h3>
            <span className="text-xs text-slate-500 font-medium">
              · {history.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                title="Clear history"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Mail className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm font-medium">No emails generated yet</p>
              <p className="text-xs text-slate-400">
                Your AI drafts, scheduled dispatches, and sent Gmail messages will appear here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-3.5 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer group space-y-2 bg-white shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px]">
                    {item.status === 'sent' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sent
                      </span>
                    ) : item.status === 'scheduled' ? (
                      <span className="inline-flex items-center gap-1 text-blue-700">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Scheduled
                      </span>
                    ) : item.status === 'drafted' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <FileEdit className="w-3.5 h-3.5" />
                        Drafted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        Generated
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h4 className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {item.subject || '(Untitled Topic)'}
                </h4>

                {item.status === 'scheduled' && item.scheduledAt && (
                  <div className="text-[11px] text-blue-700 bg-blue-50/70 border border-blue-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      Send-At:{' '}
                      {new Date(item.scheduledAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onSendScheduledNow && item.draftId && (
                        <button
                          type="button"
                          onClick={() => onSendScheduledNow(item)}
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                          title="Send immediately via Gmail"
                        >
                          <Send className="w-2.5 h-2.5" />
                          Send Now
                        </button>
                      )}
                      {onCancelSchedule && (
                        <button
                          type="button"
                          onClick={() => onCancelSchedule(item)}
                          className="p-0.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Cancel scheduled send"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[240px]">To: {item.to || 'No recipient set'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
