import OpenAI from "openai";
import { NextResponse } from "next/server";
import { FINN_SYSTEM_PROMPT } from "@/lib/finn-prompt";

let isProcessing = false;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is missing." },
      { status: 500 }
    );
  }

  if (isProcessing) {
    return NextResponse.json(
      { error: "Finn is already thinking... please wait a moment." },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }

  isProcessing = true;

  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: FINN_SYSTEM_PROMPT },
    ...history.map((msg: { role: string; text: string }) => ({
      role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: msg.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 300,
      temperature: 0.7,
      stream: true,
    });

    // Return a ReadableStream so the client can consume SSE chunks
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              // Send each token as a SSE data line
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
          isProcessing = false;
        }
      },
      cancel() {
        isProcessing = false;
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    isProcessing = false;
    const status = error?.status ?? 500;
    if (status === 429) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
