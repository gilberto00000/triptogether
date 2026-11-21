import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/db";
import { bodyOf, handleError } from "@/lib/api";
import { registerSchema } from "@/lib/schemas";
export async function POST(req: Request) {
  try {
    const data = await bodyOf(req, registerSchema); await dbConnect();
    const email = data.email.toLowerCase().trim();
    if (await User.exists({ email })) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    const user = await User.create({ name: data.name, email, passwordHash: await bcrypt.hash(data.password, 12) });
    return NextResponse.json({ id: String(user._id), name: user.name, email: user.email }, { status: 201 });
  } catch (e: unknown) { if (typeof e === "object" && e !== null && "code" in e && e.code === 11000) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 }); return handleError(e); }
}
