export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY env var" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const instructions = String(body.instructions || "").trim();
    const input = String(body.input || "").trim();

    if (!input) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing input" }),
      };
    }

    // Model is configurable via Netlify env vars
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // Standard chat completions endpoint — works on all OpenAI accounts
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(instructions
            ? [{ role: "system", content: instructions }]
            : []),
          { role: "user", content: input },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return {
        statusCode: r.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "OpenAI request failed",
          details: data,
        }),
      };
    }

    // Pull the text out of the standard response shape
    const text = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: String(text).trim() }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Server error",
        message: String(err?.message || err),
      }),
    };
  }
}
