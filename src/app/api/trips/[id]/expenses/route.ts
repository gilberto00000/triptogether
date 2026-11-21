import { NextResponse } from "next/server";
import { Expense } from "@/models/Expense";
import { bodyOf, currentUserId, handleError, tripAccess, ApiError } from "@/lib/api";
import { expenseSchema } from "@/lib/schemas";
type C = { params: Promise<{ id: string }> };
export async function GET(_req: Request, { params }: C) { try { const { id } = await params; await tripAccess(id, await currentUserId()); return NextResponse.json(await Expense.find({ trip: id }).sort({ spentAt: 1 }).lean()); } catch (e) { return handleError(e); } }
export async function POST(req: Request, { params }: C) { try { const { id } = await params; const trip = await tripAccess(id, await currentUserId()); const data = await bodyOf(req, expenseSchema); const members = new Set(trip.participants.map((p: { toString(): string }) => String(p))); if (!members.has(data.paidBy) || data.splitAmong.some((x: string) => !members.has(x))) throw new ApiError(400, "Pagador e beneficiários devem participar da viagem"); if (new Set(data.splitAmong).size !== data.splitAmong.length) throw new ApiError(400, "Participantes duplicados"); const created = await Expense.create({ ...data, trip: id }); return NextResponse.json(created, { status: 201 }); } catch (e) { return handleError(e); } }
