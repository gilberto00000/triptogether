import { NextResponse } from "next/server";
import { Trip } from "@/models/Trip";
import { dbConnect } from "@/lib/db";
import { bodyOf, currentUserId, handleError } from "@/lib/api";
import { tripSchema } from "@/lib/schemas";
export async function GET() { try { const userId = await currentUserId(); await dbConnect(); return NextResponse.json(await Trip.find({ participants: userId }).sort({ startDate: 1 }).lean()); } catch (e) { return handleError(e); } }
export async function POST(req: Request) { try { const userId = await currentUserId(); const data = await bodyOf(req, tripSchema); await dbConnect(); const trip = await Trip.create({ ...data, owner: userId, participants: [userId] }); return NextResponse.json(trip, { status: 201 }); } catch (e) { return handleError(e); } }
