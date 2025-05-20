/**
 * Supabase Edge Function: summarize
 * - Accepts JSON body: { transcript: string, length?: 'brief'|'detailed', actionItems?: boolean }
 * - Uses chunking to stay under model token limits
 * - Returns { summary }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.25.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
}

function sha256(input: string): string {
  const buffer = new TextEncoder().encode(input);
  return crypto.subtle.digest("SHA-256", buffer).then((hash) =>
    Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("")
  );
}

const cache = new Map<string, { summary: string; ts: number }>();

function chunkTranscript(text: string, charLimit = 12000): string[] {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + charLimit, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

async function summariseChunk(openai: OpenAI, chunk: string, withActions: boolean, length: string) {
  const prompt = \`Summarize the following meeting transcript in \${length === "detailed" ? "detailed paragraphs" : "concise bullet points"} and highlight key decisions\${withActions ? " and action items" : ""}.\n\n\${chunk}\`;
  const resp = await openai.chat.completions.create({
    model: Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });
  return resp.choices[0].message.content.trim();
}

serve(async (req) => {
  // CORS
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const { transcript, length = "brief", actionItems = true } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return new Response(JSON.stringify({ error: "Transcript required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DoS guard
    if (transcript.length > 20000) {
      return new Response(JSON.stringify({ error: "Transcript too long" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cacheKey = await sha256(transcript + length + actionItems);
    const cached = cache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ summary: cached.summary, cached: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const chunks = chunkTranscript(transcript);
    const partials: string[] = [];

    for (const ch of chunks) {
      const part = await summariseChunk(openai, ch, actionItems, length);
      partials.push(part);
    }

    const finalPrompt = \`Combine the following partial summaries into a cohesive \${length} meeting summary with clear sections for decisions\${actionItems ? " and action items" : ""}:\n\n\${partials.join("\n\n")}\`;
    const finalResp = await openai.chat.completions.create({
      model: Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo",
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0.3,
    });

    const summary = finalResp.choices[0].message.content.trim();

    cache.set(cacheKey, { summary, ts: Date.now() });
    if (cache.size > 100) {
      // delete oldest
      const [first] = cache.keys();
      cache.delete(first);
    }

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});