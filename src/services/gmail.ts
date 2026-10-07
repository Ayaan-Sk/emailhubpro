import { AttachmentItem, BrandConfig } from '../types';
import { buildCompleteEmailHtml } from '../utils/templateBuilder';

export interface SendEmailPayload {
  accessToken: string;
  fromName: string;
  fromEmail: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  attachments?: AttachmentItem[];
  brand: BrandConfig;
  sendAt?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

// RFC 2047 Subject Encoder for UTF-8
function encodeSubject(subject: string): string {
  // If only standard ASCII without special chars, return directly
  if (/^[\x20-\x7E]*$/.test(subject)) {
    return subject;
  }
  const utf8Bytes = new TextEncoder().encode(subject);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

// Converts a string to base64url format required by Gmail API
function toBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildMimeMessage({
  fromName,
  fromEmail,
  to,
  cc,
  bcc,
  subject,
  bodyText,
  bodyHtml,
  attachments = [],
  brand,
  sendAt,
}: Omit<SendEmailPayload, 'accessToken'>): string {
  const boundaryMixed = `mixed_bnd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const boundaryAlt = `alt_bnd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const targetDate = sendAt ? new Date(sendAt) : new Date();
  const formattedLetterDate = targetDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const fullHtml = buildCompleteEmailHtml(bodyHtml, brand, to, formattedLetterDate);

  const fromHeader = fromName ? `"${fromName.replace(/"/g, '')}" <${fromEmail}>` : fromEmail;
  const encodedSubject = encodeSubject(subject);

  const headers = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    bcc ? `Bcc: ${bcc}` : null,
    `Subject: ${encodedSubject}`,
    `Date: ${targetDate.toUTCString()}`,
    sendAt ? `X-Gmail-Send-At: ${targetDate.toISOString()}` : null,
    `MIME-Version: 1.0`,
  ].filter(Boolean);

  let mimeBody = '';

  if (attachments.length > 0) {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundaryMixed}"`);
    mimeBody += headers.join('\r\n') + '\r\n\r\n';

    // Alternative part (text + html)
    mimeBody += `--${boundaryMixed}\r\n`;
    mimeBody += `Content-Type: multipart/alternative; boundary="${boundaryAlt}"\r\n\r\n`;

    mimeBody += `--${boundaryAlt}\r\n`;
    mimeBody += `Content-Type: text/plain; charset="UTF-8"\r\n`;
    mimeBody += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
    mimeBody += `${bodyText}\r\n\r\n`;

    mimeBody += `--${boundaryAlt}\r\n`;
    mimeBody += `Content-Type: text/html; charset="UTF-8"\r\n`;
    mimeBody += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
    mimeBody += `${fullHtml}\r\n\r\n`;

    mimeBody += `--${boundaryAlt}--\r\n\r\n`;

    // Attachment parts
    for (const file of attachments) {
      mimeBody += `--${boundaryMixed}\r\n`;
      mimeBody += `Content-Type: ${file.type || 'application/octet-stream'}; name="${file.name}"\r\n`;
      mimeBody += `Content-Disposition: attachment; filename="${file.name}"\r\n`;
      mimeBody += `Content-Transfer-Encoding: base64\r\n\r\n`;
      // Break base64 into 76-char chunks per RFC spec
      const chunked = file.dataBase64.match(/.{1,76}/g)?.join('\r\n') || file.dataBase64;
      mimeBody += `${chunked}\r\n\r\n`;
    }

    mimeBody += `--${boundaryMixed}--`;
  } else {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`);
    mimeBody += headers.join('\r\n') + '\r\n\r\n';

    mimeBody += `--${boundaryAlt}\r\n`;
    mimeBody += `Content-Type: text/plain; charset="UTF-8"\r\n`;
    mimeBody += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
    mimeBody += `${bodyText}\r\n\r\n`;

    mimeBody += `--${boundaryAlt}\r\n`;
    mimeBody += `Content-Type: text/html; charset="UTF-8"\r\n`;
    mimeBody += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
    mimeBody += `${fullHtml}\r\n\r\n`;

    mimeBody += `--${boundaryAlt}--`;
  }

  return toBase64Url(mimeBody);
}

// Fetch user profile from Gmail API
export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Gmail profile: ${res.status} ${errorText}`);
  }
  return res.json();
}

// Send an email directly via Gmail API
export async function sendGmailEmail(payload: SendEmailPayload): Promise<{ id: string; threadId: string }> {
  const rawBase64Url = buildMimeMessage(payload);

  const bodyObj: Record<string, any> = { raw: rawBase64Url };
  if (payload.sendAt) {
    bodyObj.internalDate = String(new Date(payload.sendAt).getTime());
  }

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyObj),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail send failed with status ${res.status}`);
  }

  return res.json();
}

// Schedule an email for future dispatch using Gmail API draft staging + scheduled send-at execution
export async function scheduleGmailEmail(
  payload: SendEmailPayload & { sendAt: string }
): Promise<{
  id: string;
  draftId: string;
  jobId: string;
  scheduledAt: string;
}> {
  const rawBase64Url = buildMimeMessage(payload);
  const internalDateMs = String(new Date(payload.sendAt).getTime());

  // 1. Stage the message in Gmail Drafts with the scheduled internalDate and X-Gmail-Send-At MIME headers
  const draftRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        raw: rawBase64Url,
        internalDate: internalDateMs,
      },
    }),
  });

  if (!draftRes.ok) {
    const err = await draftRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to stage scheduled email in Gmail (${draftRes.status})`);
  }

  const draftData = await draftRes.json();
  const draftId = draftData.id;
  const messageId = draftData.message?.id || draftId;

  // 2. Register the scheduled send-at dispatch on the server
  const schedRes = await fetch('/api/schedule-email', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      draftId,
      rawBase64Url,
      sendAt: payload.sendAt,
      to: payload.to,
      subject: payload.subject,
    }),
  });

  const schedData = await schedRes.json().catch(() => ({ jobId: `local_${Date.now()}` }));

  return {
    id: messageId,
    draftId,
    jobId: schedData.jobId || `local_${Date.now()}`,
    scheduledAt: payload.sendAt,
  };
}

// Immediately dispatch a previously scheduled Gmail draft
export async function sendScheduledDraftNow(
  accessToken: string,
  draftId: string,
  jobId?: string
): Promise<{ id: string; threadId: string }> {
  if (jobId) {
    await fetch(`/api/schedule-email/${jobId}`, { method: 'DELETE' }).catch(() => {});
  }

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: draftId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to dispatch scheduled draft (${res.status})`);
  }

  return res.json();
}

// Cancel a scheduled Gmail dispatch and remove the staged draft
export async function cancelScheduledGmailEmail(
  accessToken: string,
  draftId?: string,
  jobId?: string
): Promise<void> {
  if (jobId) {
    await fetch(`/api/schedule-email/${jobId}`, { method: 'DELETE' }).catch(() => {});
  }
  if (draftId && accessToken) {
    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch(() => {});
  }
}

// Save as a draft in Gmail
export async function saveGmailDraft(payload: SendEmailPayload): Promise<{ id: string; message: { id: string; threadId: string } }> {
  const rawBase64Url = buildMimeMessage(payload);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: { raw: rawBase64Url },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create draft in Gmail (${res.status})`);
  }

  return res.json();
}
