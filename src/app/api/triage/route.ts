import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

const triageSchema = z.object({
  category: z.enum([
    "billing",
    "support",
    "complaint",
    "refund",
    "inquiry",
    "praise",
    "other",
  ]),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  sentiment: z.enum(["positive", "neutral", "negative", "angry"]),
  summary: z.string().describe("One sentence summary of the email"),
  keyIssues: z.array(z.string()).describe("2-4 key issues or requests"),
  suggestedAction: z
    .string()
    .describe("What the business owner should do next"),
  draftReply: z
    .string()
    .describe(
      "A professional, empathetic reply draft ready to send (2-4 short paragraphs)"
    ),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add it to your Vercel environment variables." },
      { status: 503 }
    );
  }

  const { email } = await req.json();

  if (!email?.trim()) {
    return Response.json({ error: "Email content is required" }, { status: 400 });
  }

  const result = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: triageSchema,
    prompt: `You are an expert customer success manager. Analyze this customer email and provide a structured triage response.

Customer Email:
---
${email}
---

Analyze the email and provide:
1. The category (billing/support/complaint/refund/inquiry/praise/other)
2. Priority level (urgent if safety/legal risk or major revenue impact, high if customer is very upset or blocked, medium for general issues, low for minor questions)
3. Sentiment (positive/neutral/negative/angry)
4. A one-sentence summary
5. 2-4 key issues or requests
6. What the business owner should do next (concrete action)
7. A professional, empathetic draft reply that addresses all the key issues

For the draft reply:
- Use a warm, professional tone
- Address all key issues
- Be concise (2-4 short paragraphs)
- End with a clear next step
- Don't use placeholders like [Your Name] - write as the business`,
  });

  return Response.json(result.object);
}
