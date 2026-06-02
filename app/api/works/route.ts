import { NextResponse } from "next/server";
import { works } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ works });
}
