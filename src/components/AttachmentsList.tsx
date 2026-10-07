import React, { useRef } from 'react';
import { AttachmentItem } from '../types';
import {
  Paperclip,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  FileArchive,
  File as FileIcon,
  Trash2,
  UploadCloud,
} from 'lucide-react';

interface AttachmentsListProps {
  attachments: AttachmentItem[];
  onAddAttachments: (items: AttachmentItem[]) => void;
  onRemoveAttachment: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(mime: string, name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (mime.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) {
    return <ImageIcon className="w-4 h-4 text-emerald-600" />;
  }
  if (mime.includes('pdf') || ext === 'pdf') {
    return <FileText className="w-4 h-4 text-red-600" />;
  }
  if (
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime.includes('csv') ||
    ['xlsx', 'xls', 'csv'].includes(ext)
  ) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-700" />;
  }
  if (mime.includes('zip') || mime.includes('compressed') || ['zip', 'rar', 'tar'].includes(ext)) {
    return <FileArchive className="w-4 h-4 text-amber-600" />;
  }
  if (['json', 'js', 'ts', 'html', 'css', 'py'].includes(ext)) {
    return <FileCode className="w-4 h-4 text-purple-600" />;
  }
  return <FileIcon className="w-4 h-4 text-blue-600" />;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: AttachmentItem[] = [];
    const promises: Promise<void>[] = [];

    Array.from(files).forEach((file) => {
      // 10MB per file limit check
      if (file.size > 12 * 1024 * 1024) {
        alert(`File "${file.name}" is over 12MB. Please select smaller files.`);
        return;
      }

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const resultStr = (e.target?.result as string) || '';
          // Extract purely base64 content
          const base64Index = resultStr.indexOf(';base64,');
          const cleanBase64 = base64Index !== -1 ? resultStr.substring(base64Index + 8) : resultStr;

          newItems.push({
            id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataBase64: cleanBase64,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
      promises.push(p);
    });

    Promise.all(promises).then(() => {
      onAddAttachments(newItems);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const totalBytes = attachments.reduce((sum, item) => sum + item.size, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
          Attached Documents &amp; Files
          {attachments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium lowercase">
              {attachments.length} {attachments.length === 1 ? 'file' : 'files'} &bull; {formatBytes(totalBytes)}
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Attach File
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Attachment Pills / List */}
      {attachments.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 rounded-xl p-4 text-center cursor-pointer transition-colors group"
        >
          <UploadCloud className="w-6 h-6 mx-auto mb-1 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <p className="text-xs text-slate-600 font-medium">
            Click or drag &amp; drop documents to attach (PDF, Word, Excel, Images, etc.)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Will be included as RFC MIME attachments when sending via Gmail
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="p-1.5 bg-white rounded-md border border-slate-200 shrink-0">
                    {getFileIcon(file.type, file.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(file.id)}
                  title="Remove file"
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex items-center justify-center p-2 border border-dashed border-slate-200 rounded-lg text-[11px] text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            + Attach more documents
          </div>
        </div>
      )}
    </div>
  );
};
