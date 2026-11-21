import { NextResponse } from "next/server";
import { Activity } from "@/models/Activity";
import { bodyOf, currentUserId, handleError, tripAccess, ApiError } from "@/lib/api";
import { activitySchema } from "@/lib/schemas";
type C = { params: Promise<{ id: string }> };
export async function GET(_req: Request, { params }: C) { try { const { id } = await params; await tripAccess(id, await currentUserId()); return NextResponse.json(await Activity.find({ trip: id }).sort({ startsAt: 1 }).lean()); } catch (e) { return handleError(e); } }
export async function POST(req: Request, { params }: C) { try { const { id } = await params; const trip = await tripAccess(id, await currentUserId()); const data = await bodyOf(req, activitySchema); const created = await Activity.create({ ...data, trip: id }); return NextResponse.json(created, { status: 201 }); } catch (e) { return handleError(e); } }
