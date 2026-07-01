import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const MODEL = "gemini-2.0-flash"

function getModel() {
  return google(MODEL)
}

export async function generate(prompt: string, system?: string) {
  return generateText({
    model: getModel(),
    system,
    prompt,
  })
}
