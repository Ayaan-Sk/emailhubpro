import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({ apiKey });
}

// Generate Email API
app.post('/api/generate-email', async (req, res) => {
  try {
    const {
      topic,
      senderName = '',
      recipientName = '',
      companyName = '',
      companyTagline = '',
      tone = 'executive',
      purpose = 'general',
      length = 'balanced',
      cta = '',
      attachmentNames = [],
      language = 'English',
      additionalInstructions = '',
    } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required to draft an email.' });
    }

    const ai = getGenAI();

    const systemPrompt = `You are an elite executive communications expert and professional copywriter.
Your task is to draft a comprehensive, persuasive, and impeccably structured business email based on the user's topic and specifications.

Style Guidelines:
- Tone: ${tone} (e.g., executive, warm, formal, persuasive, assertive, friendly)
- Purpose: ${purpose}
- Length guideline: ${length === 'concise' ? 'Short and direct (1-2 crisp paragraphs)' : length === 'detailed' ? 'Thorough and in-depth (3-4 detailed sections with context and background)' : 'Balanced and clear (2-3 well-formed paragraphs)'}
- Language: ${language}
${companyName ? `- Company: ${companyName}${companyTagline ? ` ("${companyTagline}")` : ''}` : ''}
${senderName ? `- Sender Name: ${senderName}` : ''}
${recipientName ? `- Recipient Name: ${recipientName}` : ''}
${cta ? `- Explicit Call to Action: ${cta}` : ''}
${attachmentNames.length > 0 ? `- The email includes the following attached documents: ${attachmentNames.join(', ')}. Seamlessly reference them in the text.` : ''}
${additionalInstructions ? `- Additional User Notes: ${additionalInstructions}` : ''}

Output Requirements:
Return a JSON object with:
1. "subject": A punchy, high-open-rate subject line.
2. "alternativeSubjects": An array of 3 distinct alternative subject lines (e.g., direct, curiosity-driven, executive).
3. "bodyText": Complete plain-text email version (including greeting, paragraphs, bullet points if helpful, and professional sign-off with sender name).
4. "bodyHtml": Beautifully formatted HTML content for the message body. Use clean semantic tags: <p>, <ul>, <li>, <strong>, <em>, and <div style="..."> for callouts/highlights if appropriate. Do NOT include <html>, <head>, or <body> tags—only the inner content.
5. "keyTakeaways": An array of 2 to 4 bullet points summarizing the core message.
6. "suggestedFollowUp": A brief recommendation for when and how the sender should follow up.`;

    const userPrompt = `Email topic and brief:
"${topic.trim()}"

Please draft the complete professional email now.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences
      const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(clean);
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate email with AI.',
    });
  }
});

// Refine/Edit Email API
app.post('/api/refine-email', async (req, res) => {
  try {
    const {
      currentSubject,
      currentBodyText,
      currentBodyHtml,
      instruction,
    } = req.body;

    if (!instruction || !currentBodyText) {
      return res.status(400).json({ error: 'Instruction and existing email body are required.' });
    }

    const ai = getGenAI();

    const prompt = `You are an executive email editor.
Here is the current email:
Subject: ${currentSubject}

Body Text:
${currentBodyText}

User's refinement instruction:
"${instruction}"

Please modify and polish the email strictly according to this instruction while preserving key facts and professional etiquette.
Return a valid JSON object with:
1. "subject": The updated subject line.
2. "bodyText": The complete updated plain text.
3. "bodyHtml": The complete updated clean HTML snippet (paragraphs, bullets, emphasis).
4. "changeSummary": A one-sentence explanation of what was improved.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(clean);
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error refining email:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to refine email.',
    });
  }
});

// Scheduled Email Dispatch Queue
interface ScheduledJob {
  id: string;
  draftId?: string;
  rawBase64Url: string;
  sendAt: string;
  to: string;
  subject: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  timer: ReturnType<typeof setTimeout>;
}

const scheduledJobs = new Map<string, ScheduledJob>();

app.post('/api/schedule-email', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization Bearer token for Gmail API.' });
    }

    const { draftId, rawBase64Url, sendAt, to, subject } = req.body;
    if (!rawBase64Url || !sendAt) {
      return res.status(400).json({ error: 'Missing raw message payload or sendAt timestamp.' });
    }

    const targetTime = new Date(sendAt).getTime();
    const now = Date.now();
    const delayMs = Math.max(1000, targetTime - now);
    const jobId = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const timer = setTimeout(async () => {
      const job = scheduledJobs.get(jobId);
      if (!job || job.status !== 'scheduled') return;

      try {
        // Dispatch via Gmail API drafts.send if draft was staged, otherwise messages.send
        const endpoint = draftId
          ? 'https://gmail.googleapis.com/gmail/v1/users/me/drafts/send'
          : 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
        const bodyPayload = draftId
          ? { id: draftId, message: { raw: rawBase64Url } }
          : { raw: rawBase64Url };

        const gmailRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
        });

        if (gmailRes.ok) {
          job.status = 'sent';
        } else {
          job.status = 'failed';
        }
      } catch (err) {
        console.error('Scheduled Gmail send error:', err);
        job.status = 'failed';
      }
    }, Math.min(delayMs, 2147483647));

    scheduledJobs.set(jobId, {
      id: jobId,
      draftId,
      rawBase64Url,
      sendAt,
      to: to || '',
      subject: subject || '',
      status: 'scheduled',
      timer,
    });

    return res.json({
      success: true,
      jobId,
      scheduledAt: sendAt,
    });
  } catch (error: any) {
    console.error('Error scheduling email:', error);
    return res.status(500).json({ error: error?.message || 'Failed to schedule email.' });
  }
});

app.delete('/api/schedule-email/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = scheduledJobs.get(jobId);
  if (job) {
    clearTimeout(job.timer);
    job.status = 'cancelled';
    scheduledJobs.delete(jobId);
  }
  return res.json({ success: true });
});

// Portal Access Authentication Endpoint
app.post('/api/auth/login', (req, res) => {
  const { id, password } = req.body || {};
  const normalizedId = typeof id === 'string' ? id.trim().toLowerCase() : '';
  const rawPass = typeof password === 'string' ? password : '';

  if (normalizedId === 'admin@worklyft.in' && rawPass === 'worklyft8080') {
    return res.json({
      success: true,
      user: {
        id: 'admin@worklyft.in',
        role: 'Administrator',
        organization: 'Worklyft',
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid Workspace ID or password. Access denied.',
  });
});

// Mount Vite or Static Files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
