import { NextResponse } from "next/server";
import { Activity } from "@/models/Activity";
import { bodyOf, currentUserId, handleError, objectId, tripAccess, ApiError } from "@/lib/api";
import { activityPatchSchema } from "@/lib/schemas";
type C = { params: Promise<{ id: string; activityId: string }> };
export async function PATCH(req: Request, { params }: C) { try { const { id, activityId } = await params; const trip = await tripAccess(id, await currentUserId()); objectId(activityId); const item = await Activity.findOne({ _id: activityId, trip: id }); if (!item) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 }); const data = await bodyOf(req, activityPatchSchema); Object.assign(item, data); await item.save(); return NextResponse.json(item); } catch (e) { return handleError(e); } }
export async function DELETE(_req: Request, { params }: C) { try { const { id, activityId } = await params; await tripAccess(id, await currentUserId()); objectId(activityId); const item = await Activity.findOneAndDelete({ _id: activityId, trip: id }); if (!item) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 }); return NextResponse.json({ message: "Registro excluído" }); } catch (e) { return handleError(e); } }
