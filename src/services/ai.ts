import { EmailTone, EmailLength } from '../types';

export interface GenerateEmailParams {
  topic: string;
  senderName?: string;
  recipientName?: string;
  companyName?: string;
  companyTagline?: string;
  tone?: EmailTone;
  purpose?: string;
  length?: EmailLength;
  cta?: string;
  attachmentNames?: string[];
  language?: string;
  additionalInstructions?: string;
}

export interface GeneratedEmailResult {
  subject: string;
  alternativeSubjects: string[];
  bodyText: string;
  bodyHtml: string;
  keyTakeaways: string[];
  suggestedFollowUp?: string;
}

export async function requestGenerateEmail(params: GenerateEmailParams): Promise<GeneratedEmailResult> {
  const response = await fetch('/api/generate-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate email.');
  }

  return json.data;
}

export async function requestRefineEmail(params: {
  currentSubject: string;
  currentBodyText: string;
  currentBodyHtml: string;
  instruction: string;
}): Promise<{
  subject: string;
  bodyText: string;
  bodyHtml: string;
  changeSummary?: string;
}> {
  const response = await fetch('/api/refine-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to refine email.');
  }

  return json.data;
}
