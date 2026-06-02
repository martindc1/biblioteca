import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOpenAIClient } from "@/lib/openai";

const BodySchema = z.object({
  question: z.string().min(1).max(1200),
});

export async function POST(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Pregunta inválida." }, { status: 400 });
  }

  const client = createOpenAIClient();

  if (!client) {
    return NextResponse.json({
      answer:
        "Modo local: todavía no hay clave de OpenAI configurada. Conceptualmente, esta pregunta debería responderse conectando el texto abierto, tus notas y el mapa de resonancias, sin producir ruido innecesario.",
    });
  }

  const completion = await client.chat.completions.create({
    model: "gpt-5.5",
    messages: [
      {
        role: "system",
        content:
          "Eres el Bibliotecario de una aplicación llamada Biblioteca. Respondes en español. Tu tarea es ampliar, reducir o silenciar. No sobreexpliques: conecta ideas con precisión, claridad y calma.",
      },
      {
        role: "user",
        content: parsed.data.question,
      },
    ],
  });

  return NextResponse.json({
    answer: completion.choices[0]?.message?.content ?? "No pude generar una respuesta.",
  });
}
