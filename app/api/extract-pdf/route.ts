import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No recibí ningún archivo PDF." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "El archivo no parece ser un PDF." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await pdf(buffer);

    return NextResponse.json({
      title: file.name.replace(/\.pdf$/i, ""),
      text: result.text.trim(),
      pages: result.numpages,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pude extraer texto del PDF. Puede estar escaneado como imagen o protegido." },
      { status: 500 }
    );
  }
}
