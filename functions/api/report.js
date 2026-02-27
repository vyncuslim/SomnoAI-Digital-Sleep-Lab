export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return new Response("Use POST", { status: 405 });

  const body = await request.json();
  const prompt = body?.prompt ?? "用一句话解释什么是深睡眠。";

  const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: String(prompt) }
    ]
  });

  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" }
  });
}
