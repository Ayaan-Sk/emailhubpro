import React, { useState } from 'react';
import { BrandConfig, TemplateStyle } from '../types';
import {
  X,
  Upload,
  Sparkles,
  Building2,
  Palette,
  Layout,
  FileCheck,
  Trash2,
  Check,
} from 'lucide-react';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandConfig;
  onSave: (updated: BrandConfig) => void;
}

// Built-in sample executive logos (clean SVGs as data URIs)
const PRESET_LOGOS = [
  {
    name: 'Nexus Tech',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect width="36" height="36" y="2" rx="8" fill="%232563eb"/><polygon points="20,10 28,26 12,26" fill="%23ffffff"/><text x="46" y="26" font-family="sans-serif" font-weight="bold" font-size="20" fill="%231e293b">NEXUS</text></svg>`,
  },
  {
    name: 'Apex Capital',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><circle cx="20" cy="20" r="18" fill="%23047857"/><circle cx="20" cy="20" r="8" fill="%23ffffff"/><text x="46" y="26" font-family="sans-serif" font-weight="bold" font-size="20" fill="%231e293b">APEX</text></svg>`,
  },
  {
    name: 'Vanguard Media',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect width="36" height="36" y="2" rx="10" fill="%239333ea"/><path d="M12 14 L20 28 L28 14" stroke="%23ffffff" stroke-width="4" fill="none" stroke-linecap="round"/><text x="46" y="26" font-family="sans-serif" font-weight="bold" font-size="20" fill="%231e293b">VANGUARD</text></svg>`,
  },
  {
    name: 'Cobalt Advisory',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect width="36" height="36" y="2" rx="6" fill="%230f172a"/><circle cx="20" cy="20" r="7" fill="%2338bdf8"/><text x="46" y="26" font-family="sans-serif" font-weight="bold" font-size="20" fill="%231e293b">COBALT</text></svg>`,
  },
];

const PRESET_COLORS = [
  { name: 'Executive Navy', value: '#1e3a8a' },
  { name: 'Royal Indigo', value: '#4338ca' },
  { name: 'Emerald Forest', value: '#047857' },
  { name: 'Slate Obsidian', value: '#0f172a' },
  { name: 'Burgundy Crimson', value: '#991b1b' },
  { name: 'Teal Cyan', value: '#0d9488' },
  { name: 'Warm Amber', value: '#b45309' },
];

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  brand,
  onSave,
}) => {
  const [form, setForm] = useState<BrandConfig>({ ...brand });
  const [activeTab, setActiveTab] = useState<'brand' | 'template' | 'signature'>('brand');

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size should be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setForm((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Company Branding &amp; Logo
              </h2>
              <p className="text-xs text-slate-500">
                Format emails with professional branding, logos, and signatures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('brand')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'brand'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            Logo &amp; Brand Colors
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'template'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            Template Layout
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'signature'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Signature &amp; Disclaimer
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'brand' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tagline / Motto
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    placeholder="e.g. Innovating Enterprise Excellence"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Logo Management */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Company Logo
                </label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Logo Preview Box */}
                    <div className="w-36 h-20 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 relative overflow-hidden group">
                      {form.logoUrl ? (
                        <>
                          <img
                            src={form.logoUrl}
                            alt="Logo Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="text-center text-slate-400">
                          <Building2 className="w-6 h-6 mx-auto mb-1 opacity-60" />
                          <span className="text-[10px] uppercase font-bold">No Logo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          Upload Logo (PNG, SVG, JPG)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {form.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                            className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Recommended: High resolution PNG with transparent background or SVG (max 2MB).
                      </p>
                    </div>
                  </div>

                  {/* Preset Logos */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Or choose an executive preset:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_LOGOS.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, logoUrl: item.svg }))}
                          className={`p-2 bg-white border rounded-lg hover:border-blue-400 transition-all text-left flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            form.logoUrl === item.svg
                              ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/20'
                              : 'border-slate-200'
                          }`}
                        >
                          <img src={item.svg} alt={item.name} className="h-6 object-contain" />
                          <span className="text-[11px] font-medium text-slate-600">
                            {item.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Options */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Logo Size
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-200 p-0.5 rounded-lg text-xs">
                        {(['small', 'medium', 'large'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, logoSize: sz }))}
                            className={`py-1 text-center capitalize rounded-md font-medium cursor-pointer transition-all ${
                              form.logoSize === sz
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Logo Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-200 p-0.5 rounded-lg text-xs">
                        {(['left', 'center', 'right'] as const).map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, logoAlign: al }))}
                            className={`py-1 text-center capitalize rounded-md font-medium cursor-pointer transition-all ${
                              form.logoAlign === al
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {al}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Brand Color Palette
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, primaryColor: col.value }))
                      }
                      title={col.name}
                      className={`w-9 h-9 rounded-xl transition-transform flex items-center justify-center cursor-pointer shadow-xs ${
                        form.primaryColor === col.value
                          ? 'ring-3 ring-blue-400 ring-offset-2 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.value }}
                    >
                      {form.primaryColor === col.value && (
                        <Check className="w-4 h-4 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600 uppercase">
                      {form.primaryColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                Select Visual Format for Outgoing Emails
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'executive' as TemplateStyle,
                    title: 'Executive Suite',
                    desc: 'Primary brand banner with white logo badge, formal greeting, distinct callout card, and corporate footer.',
                    previewStyle: 'bg-gradient-to-b from-blue-900 via-white to-slate-100',
                  },
                  {
                    id: 'modern' as TemplateStyle,
                    title: 'Modern Stripe',
                    desc: 'Slim colored top accent bar, floating company logo, crisp sans-serif paragraphs, and neat button styling.',
                    previewStyle: 'border-t-4 border-t-blue-600 bg-white',
                  },
                  {
                    id: 'minimalist' as TemplateStyle,
                    title: 'Minimalist Editorial',
                    desc: 'Pure monochrome luxury feel, subtle hairline divider, spacious typography, and elegant discreet footer.',
                    previewStyle: 'border-b border-slate-200 bg-white',
                  },
                  {
                    id: 'letter' as TemplateStyle,
                    title: 'Official Letterhead',
                    desc: 'Traditional high-stakes corporate correspondence with sender address block, date, subject line, and serif text.',
                    previewStyle: 'border-2 border-slate-300 bg-amber-50/30',
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, templateStyle: tpl.id }))
                    }
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer relative ${
                      form.templateStyle === tpl.id
                        ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{tpl.title}</h4>
                      {form.templateStyle === tpl.id && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'signature' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={form.signature.senderName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        signature: { ...prev.signature, senderName: e.target.value },
                      }))
                    }
                    placeholder="e.g. Ayaan Sheikh"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={form.signature.jobTitle}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        signature: { ...prev.signature, jobTitle: e.target.value },
                      }))
                    }
                    placeholder="e.g. Chief Executive Officer"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={form.signature.department}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        signature: { ...prev.signature, department: e.target.value },
                      }))
                    }
                    placeholder="e.g. Executive Operations"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.signature.phone}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        signature: { ...prev.signature, phone: e.target.value },
                      }))
                    }
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Company Website
                  </label>
                  <input
                    type="text"
                    value={form.signature.website}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        signature: { ...prev.signature, website: e.target.value },
                      }))
                    }
                    placeholder="e.g. https://www.acmecorp.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.signature.includeDisclaimer}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        signature: {
                          ...prev.signature,
                          includeDisclaimer: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Include Confidentiality Disclaimer
                  </span>
                </label>
                {form.signature.includeDisclaimer && (
                  <textarea
                    rows={2}
                    value={form.signature.disclaimerText}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        signature: {
                          ...prev.signature,
                          disclaimerText: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs text-slate-600 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Apply Brand Styles
          </button>
        </div>
      </div>
    </div>
  );
};
