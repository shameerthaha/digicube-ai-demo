import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json(
      { error: "OPENROUTER_API_KEY is not configured. Add it to your Vercel environment variables." },
      { status: 503 }
    );
  }

  const { email } = await req.json();

  if (!email?.trim()) {
    return Response.json({ error: "Email content is required" }, { status: 400 });
  }

  let text: string;
  try {
    const result = await generateText({
      model: openrouter("meta-llama/llama-3.1-8b-instruct:free"),
      prompt: `You are an expert customer success manager. Analyze this customer email and respond with ONLY a valid JSON object — no markdown, no explanation, just the JSON.

Customer Email:
---
${email}
---

Respond with this exact JSON structure:
{
  "category": "<one of: billing|support|complaint|refund|inquiry|praise|other>",
  "priority": "<one of: urgent|high|medium|low>",
  "sentiment": "<one of: positive|neutral|negative|angry>",
  "summary": "<one sentence summary>",
  "keyIssues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "suggestedAction": "<concrete next action for the business owner>",
  "draftReply": "<professional empathetic reply, 2-4 short paragraphs, no placeholders, write as the business>"
}

Priority guide: urgent=safety/legal risk or major revenue impact, high=customer very upset or blocked, medium=general issues, low=minor questions.`,
    });
    text = result.text;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("OpenRouter error:", msg);
    return Response.json({ error: msg }, { status: 502 });
  }

  // Strip any markdown code fences the model might add
  const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const data = JSON.parse(clean);

  return Response.json(data);
}
