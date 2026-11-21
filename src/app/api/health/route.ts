import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect, dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

// Abra /api/health no navegador (local ou na Vercel) para conferir banco e variáveis de ambiente.
export async function GET() {
  const auth = { NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET, NEXTAUTH_URL: !!process.env.NEXTAUTH_URL };
  try {
    await dbConnect();
    await mongoose.connection.db!.admin().ping();
    return NextResponse.json({ ok: true, database: mongoose.connection.name, env: auth });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: dbErrorMessage(e) ?? "Falha ao conectar ao banco.", env: auth }, { status: 503 });
  }
}
