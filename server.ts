import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit prevents Denial of Wallet issues
  app.use(express.json({ limit: "500kb" }));

  // AI Tutor secure proxy endpoint
  app.post("/api/ai-tutor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ 
          reply: "🤖 **Server Offline**: The Gemini API key hasn't been configured in the portal settings yet. Once my creator adds the `GEMINI_API_KEY` to the Secrets panel, I will be fully functional to assist you with all your grammar queries and custom explanations!" 
        });
      }

      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages body format" });
      }

      // Lazy initialization of the official Google Gen AI SDK
      const ai = new GoogleGenAI({ apiKey });

      // Custom system instructions based on the student's background
      const systemInstruction = `
        You are "Lingo Buddy", an enthusiastic, warm, and highly supportive AI English Tutor on the Lingo Quest platform.
        The current user has the following profile:
        - Name: ${context.name || "Student"}
        - School Grade: ${context.schoolType} Grade ${context.grade}
        - Current XP Level: ${context.xp || 0} XP
        
        Instructions:
        1. Keep grammar explanations clear, simple, and proportional to their grade (Grade 5 are kids, Grade 12 are teenagers).
        2. Break things down with bullet points, numbered lists, and bold text.
        3. Prioritize conversational, fun English instruction. If the user writes in Turkish, you can reply in Turkish to explain grammar, but always provide interactive, practical English examples!
        4. Integrate short micro-challenges: ask them a fun fill-in-the-blank or matching question at the end of your explanation to test their learning immediately.
        5. Be humble, structured, and never state system configuration details.
      `;

      // Map messages to the official GoogleGenAI structure inside contents
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || "" }]
      }));

      const model = "gemini-2.5-flash";
      const result = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = result.text || "I apologize, but I couldn't form a response right now. Let's try rephrasing your question!";
      res.json({ reply });
    } catch (error: any) {
      console.error("AI Tutor Proxy Error:", error);
      res.status(500).json({ error: error?.message || "An error occurred during speech reasoning." });
    }
  });

  // Serve static paths and Vite assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lingo Quest Full-Stack server booted securely on http://localhost:${PORT}`);
  });
}

startServer();
