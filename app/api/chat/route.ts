import OpenAI from "openai";
import { NextResponse } from "next/server";

// In-flight request guard — only one AI call at a time server-side
let isProcessing = false;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { response: "⚠️ GROQ_API_KEY is missing. Get a free key at console.groq.com and add it to .env.local, then restart the server." },
      { status: 500 }
    );
  }

  // Reject if a request is already being processed
  if (isProcessing) {
    return NextResponse.json(
      { response: "Finn is already thinking... please wait a moment before sending another message. 🙏" },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ response: "Invalid request body." }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return NextResponse.json({ response: "Message cannot be empty." }, { status: 400 });
  }

  isProcessing = true;

  try {
    // Groq is 100% free & OpenAI-compatible — just swap the baseURL
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Build message history in OpenAI format
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are Finn, a calm, empathetic, and insightful AI companion for a mental wellness app. " +
          "Your primary goal is to make users feel heard and understood. " +
          "Instead of giving generic advice, always ask ONE thoughtful follow-up question to understand the user's situation better. " +
          "Be concise, warm, and non-judgmental. Speak in the same language as the user. " +
          "Keep responses under 150 words."
      },
      // Map prior conversation history
      ...history.map((msg: { role: string; text: string }) => ({
        role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.text,
      })),
      // Current user message
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Free, fast Llama model on Groq
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const responseText =
      completion.choices[0]?.message?.content ?? "I'm here for you. Can you tell me more?";

    return NextResponse.json({ response: responseText });

  } catch (error: any) {
    const status = error?.status ?? 500;
    const errMsg = String(error?.message || error);
    console.error("Groq API Error:", errMsg);

    if (status === 429) {
      return NextResponse.json(
        { response: "Finn is a bit overwhelmed right now 🙏 Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    if (status === 401) {
      return NextResponse.json(
        { response: "⚠️ Invalid Groq API key. Please check your .env.local file." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { response: "⚠️ Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  } finally {
    isProcessing = false;
  }
}
