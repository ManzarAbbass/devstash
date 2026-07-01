export async function generate(prompt: string, system?: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://devstashproject.vercel.app",
      "X-Title": "DevStash",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-v4-flash",
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`)
  }

  const json = await res.json() as { choices: Array<{ message: { content: string } }> }

  return { text: json.choices[0]?.message?.content ?? "" }
}
