export type EmailTone = 'executive' | 'friendly' | 'formal' | 'persuasive' | 'urgent';
export type EmailLength = 'concise' | 'balanced' | 'detailed';
export type TemplateStyle = 'executive' | 'modern' | 'minimalist' | 'letter';

export interface SignatureConfig {
  senderName: string;
  jobTitle: string;
  department: string;
  company: string;
  phone: string;
  website: string;
  includeDisclaimer: boolean;
  disclaimerText: string;
}

export interface BrandConfig {
  companyName: string;
  tagline: string;
  logoUrl: string; // base64 data URI or image URL
  logoSize: 'small' | 'medium' | 'large';
  logoAlign: 'left' | 'center' | 'right';
  primaryColor: string;
  accentColor: string;
  templateStyle: TemplateStyle;
  signature: SignatureConfig;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataBase64: string; // purely base64 string
}

export interface EmailData {
  fromName: string;
  fromEmail: string;
  to: string;
  cc: string;
  bcc: string;
  topic: string;
  tone: EmailTone;
  purpose: string;
  length: EmailLength;
  cta: string;
  language: string;
  subject: string;
  alternativeSubjects: string[];
  bodyText: string;
  bodyHtml: string;
  keyTakeaways: string[];
  suggestedFollowUp?: string;
  attachments: AttachmentItem[];
  brand: BrandConfig;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  subject: string;
  to: string;
  topic: string;
  status: 'sent' | 'drafted' | 'generated' | 'scheduled';
  gmailId?: string;
  draftId?: string;
  scheduledAt?: string;
  previewSnippet?: string;
}
