const API_KEY = "H0mzpolJHy2RMAVuOartDMqDl5sJ9ftM";
const API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function generateMistral(prompt, params = {}) {
  console.log("🤖 MISTRAL: Appel API avec prompt:", prompt);
  console.log("🤖 MISTRAL: Paramètres:", params);

  try {
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

    console.log("🤖 MISTRAL: Statut de la réponse:", res.status);
    const data = await res.json();
    console.log("🤖 MISTRAL: Réponse complète:", data);

    const content = data.choices?.[0]?.message?.content || "";
    console.log("🤖 MISTRAL: Contenu extrait:", content);

    return content;
  } catch (error) {
    console.log("🤖 MISTRAL: Erreur lors de l'appel API:", error);
    throw error;
  }
}
