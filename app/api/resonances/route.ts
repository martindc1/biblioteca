import { NextResponse } from "next/server";
import { nodes, resonances } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ resonances, nodes });
}
