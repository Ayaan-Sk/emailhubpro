import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
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
    } = body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required to draft an email.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in your Vercel project environment variables.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

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
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
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
    console.error('Error generating email:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate email with AI.',
    });
  }
}
