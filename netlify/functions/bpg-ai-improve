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
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    // Responses API is the modern endpoint OpenAI recommends for agentic / structured flows. :contentReference[oaicite:0]{index=0}
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          ...(instructions
            ? [{ role: "system", content: [{ type: "input_text", text: instructions }] }]
            : []),
          { role: "user", content: [{ type: "input_text", text: input }] },
        ],
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

    // Pull the combined text out (defensive)
    const text =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output
            .flatMap((item) => item?.content || [])
            .map((c) => c?.text)
            .filter(Boolean)
            .join("\n")
        : "");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: String(text || "") }),
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
