import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const { expression, result, type } = await req.json();

    let prompt = "";
    if (type === "explain") {
      prompt = `You are a helpful math teacher. Explain the step-by-step breakdown and concept behind evaluating this calculation:
Expression: ${expression}
Calculated Result: ${result}

Keep your answer concise, easy to read, clearly formatted with markdown bullets or numbered steps, and highlight any real-world application or math rule used.`;
    } else if (type === "solve_word_problem") {
      prompt = `You are a mathematical problem solver. The user has this question or word problem:
"${expression}"

Provide:
1. The mathematical equation/expression needed.
2. The final step-by-step calculation and exact numerical answer.
3. A brief 1-sentence conclusion.`;
    } else {
      prompt = `Explain this math calculation: ${expression} = ${result}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ explanation: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
