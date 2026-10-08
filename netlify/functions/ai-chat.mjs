/**
 * UDCH Care+ — AI Chat (Netlify Function)
 * Secrets (Netlify env): OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY
 * Body: { message, provider?, model?, lang?, history? }
 */

const SYSTEM_TH = `คุณเป็นผู้ช่วยสุขภาพของโรงพยาบาลศูนย์มะเร็ง จ.อุดรธานี (UDCH Care+)
- ตอบภาษาไทย กระชับ เข้าใจง่าย เป็นมิตร
- ไม่วินิจฉัยโรคแทนแพทย์ ไม่สั่งยาเอง
- หากอาการรุนแรง (ไข้สูง ปวดมาก หายใจลำบาก) แนะนำให้ติดต่อโรงพยาบาลทันที
- ตอบเฉพาะข้อมูลทั่วไปเกี่ยวกับการรักษามะเร็ง การเตรียมตัว นัดหมาย การดูแลตัวเอง`;

const SYSTEM_EN = `You are a health assistant for Udonthani Cancer Hospital (UDCH Care+).
- Reply in English, briefly and kindly.
- Do not diagnose or prescribe.
- For severe symptoms, advise contacting the hospital immediately.`;

function json(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

async function callOpenAI(apiKey, model, system, message, history) {
  const messages = [
    { role: "system", content: system },
    ...(history || []).slice(-8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text || m.content || "",
    })),
    { role: "user", content: message },
  ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages,
      temperature: 0.4,
      max_tokens: 800,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI HTTP ${res.status}`);
  }
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callAnthropic(apiKey, model, system, message) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "claude-3-5-haiku-latest",
      max_tokens: 800,
      system,
      messages: [{ role: "user", content: message }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Anthropic HTTP ${res.status}`);
  }
  const part = data.content?.find((c) => c.type === "text");
  return part?.text?.trim() || "";
}

async function callGoogle(apiKey, model, system, message) {
  const m = model || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Google HTTP ${res.status}`);
  }
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("")?.trim() || "";
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const message = (body.message || "").trim();
  if (!message) {
    return json(400, { error: "message required" });
  }

  const provider = (body.provider || "openai").toLowerCase();
  const model = body.model || "";
  const lang = body.lang === "en" ? "en" : "th";
  const system = lang === "en" ? SYSTEM_EN : SYSTEM_TH;
  const history = Array.isArray(body.history) ? body.history : [];

  const keys = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
  };

  const order = [provider, "openai", "anthropic", "google"].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  let lastError = "No API key configured";
  for (const p of order) {
    const key = keys[p];
    if (!key) continue;
    try {
      let reply = "";
      if (p === "openai") {
        reply = await callOpenAI(key, model || "gpt-4o-mini", system, message, history);
      } else if (p === "anthropic") {
        reply = await callAnthropic(key, model || "claude-3-5-haiku-latest", system, message);
      } else if (p === "google") {
        reply = await callGoogle(key, model || "gemini-2.0-flash", system, message);
      }
      if (reply) {
        return json(200, { reply, provider: p, model: model || null });
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error("[ai-chat]", p, lastError);
    }
  }

  return json(503, {
    error: lastError,
    hint: "Set OPENAI_API_KEY (or ANTHROPIC_API_KEY / GOOGLE_AI_API_KEY) in Netlify environment variables",
  });
}
