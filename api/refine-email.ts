import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const {
      currentSubject,
      currentBodyText,
      instruction,
    } = body;

    if (!instruction || !currentBodyText) {
      return res.status(400).json({ error: 'Instruction and existing email body are required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in your Vercel project environment variables.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error refining email:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to refine email.',
    });
  }
}
