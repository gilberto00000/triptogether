import { NextResponse } from "next/server";
import { ChecklistItem } from "@/models/ChecklistItem";
import { bodyOf, currentUserId, handleError, tripAccess, ApiError } from "@/lib/api";
import { itemSchema } from "@/lib/schemas";
type C = { params: Promise<{ id: string }> };
export async function GET(
    _req: Request,
    { params }: C) {
    try {
        const { id } = await params;
        await tripAccess(id, await currentUserId());

        return NextResponse.json(await ChecklistItem.find({ trip: id }).sort({ createdAt: 1 }).lean());
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(
    req: Request,
    { params }: C) {
    try {
        
        const { id } = await params;
        const trip = await tripAccess(id, await currentUserId());
        const data = await bodyOf(req, itemSchema);

        if (data.assignedTo && !trip.participants.some(
            (p: { toString(): string }) => String(p) === data.assignedTo
        ))
            throw new ApiError(400, "Responsável não participa da viagem");

        const created = await ChecklistItem.create({ ...data, trip: id });

        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        return handleError(e);
    }
}
