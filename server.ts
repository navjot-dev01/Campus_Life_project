import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Chatbot Gemini AI endpoint for Educational & Study Guidance
  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, studentContext, intent } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      const ai = getAIClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY not configured on server.',
          fallbackAvailable: true
        });
      }

      let roleSpecificGuidance = '';
      if (intent === 'GENERAL_ACADEMIC_GUIDANCE') {
        roleSpecificGuidance = `The student is asking for academic guidance, exam preparation strategies, revision tips, or study recommendations.
Provide an actionable, structured study and revision plan with:
- Core high-yield concepts to prioritize
- Step-by-step preparation or revision roadmap
- Practical problem-solving tips (e.g. numericals, query writing, theory)
- Common exam pitfalls to avoid
Do NOT invent fake official college administration exam dates or official deadlines. Focus purely on academic coaching and study methodology.`;
      } else {
        roleSpecificGuidance = `The student is asking an educational or conceptual question. Provide a clear, accurate, and structured explanation with definitions, bullet points, and code/syntax examples if relevant.`;
      }

      const systemInstruction = `You are the CampusLife Student Support AI Assistant for undergraduate students.
Student: ${studentContext?.studentName || 'Student'}, Department: ${studentContext?.department || 'Computer Science & Engineering'}.

${roleSpecificGuidance}

Formatting:
- Use clean Markdown with headers (###), bullet points, and bold text for readability.
- Keep the tone encouraging, professional, and clear.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nStudent Query: "${prompt}"` }]
            }
          ]
        });
      } catch (firstErr: any) {
        console.warn('Attempt with gemini-3.8-flash failed, trying gemini-3.6-flash:', firstErr?.message);
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nStudent Query: "${prompt}"` }]
            }
          ]
        });
      }

      const responseText = response.text || "Here is general educational guidance on the topic you asked about.";
      return res.json({ text: responseText });
    } catch (err: any) {
      console.error('Error handling /api/chat:', err);
      return res.status(500).json({
        error: 'Failed to generate guidance from AI.',
        details: err?.message
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusLife Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
