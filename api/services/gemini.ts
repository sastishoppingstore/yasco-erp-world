import { GoogleGenerativeAI } from "@google/generative-ai";

const defaultModel = "gemini-2.0-flash";

export const SYSTEM_PROMPT = `You are an AI assistant for an ERP system. Your role is to:
- Answer business questions clearly and concisely in the user's language
- Use the data provided to give accurate, helpful answers
- If the data is empty or shows no results, explain that clearly
- Keep responses short and focused (2-3 sentences preferred)
- Never make up data or numbers

Current time: ${new Date().toISOString()}`;

export async function generateResponse(params: {
  query: string;
  data?: any;
  queryType?: string;
  dbResponse?: string;
  apiKey?: string;
  model?: string;
}): Promise<string | null> {
  if (!params.apiKey) return null;

  const genAI = new GoogleGenerativeAI(params.apiKey);
  const model = genAI.getGenerativeModel({ model: params.model || defaultModel });

  const dataContext = params.data
    ? `\n\nQuery type: ${params.queryType || "general"}\nDatabase result: ${JSON.stringify(params.data, null, 2)}`
    : "";

  const existingResponse = params.dbResponse
    ? `\n\nExisting system response: ${params.dbResponse}`
    : "";

  const prompt = `${SYSTEM_PROMPT}

User query: ${params.query}${dataContext}${existingResponse}

Provide a natural, helpful response. If the user is asking in Arabic or Urdu, respond in that language. Keep it brief and actionable.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err: any) {
    console.error("Gemini API error:", err.message);
    return null;
  }
}
