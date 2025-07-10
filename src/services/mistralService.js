const API_KEY = "H0mzpolJHy2RMAVuOartDMqDl5sJ9ftM";
const API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function generateMistral(prompt, params = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: params.model || "mistral-tiny",
      messages: [{ role: "user", content: prompt }],
      temperature: params.temperature ?? 0.1,
      max_tokens: params.max_tokens ?? 64,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
