/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    if (request.method === "GET") {
      return new Response(
        JSON.stringify("HoverGPT backend is running. Send a POST request with JSON."),
        {
          headers: corsHeaders(),
        }
      );
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify("Method not allowed."), {
        status: 405,
        headers: corsHeaders(),
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify("Invalid JSON request body."), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const { prompt, image } = body;
    const messages = [
      {
        role: "system",
        content:
          "Answer clearly and concisely. When an image is provided, describe and reason from the visible screenshot.",
      },
      {
        role: "user",
        content: image
          ? [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: image,
              },
            ]
          : prompt,
      },
    ];
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);
    let response;

    try {
      response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${env.MISTRALKEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: image ? "mistral-small-2506" : "mistral-small-latest",
            messages,
            max_tokens: image ? 300 : 600,
          }),
        }
      );
    } catch (err) {
      const message =
        err.name === "AbortError"
          ? "Mistral request timed out after 40 seconds."
          : err.message || "Mistral request failed.";

      return new Response(JSON.stringify(message), {
        status: 504,
        headers: corsHeaders(),
      });
    } finally {
      clearTimeout(timeout);
    }

    const result = await response.json();
    if (!response.ok) {
      const message =
        result.error?.message ||
        result.message ||
        `Mistral API error (${response.status})`;

      return new Response(
        JSON.stringify(message),
        {
          status: response.status,
          headers: corsHeaders(),
        }
      );
    }

    const answer = result.choices[0].message.content;

    return new Response(JSON.stringify(answer), {
      headers: corsHeaders(),
    });
  },
};

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
