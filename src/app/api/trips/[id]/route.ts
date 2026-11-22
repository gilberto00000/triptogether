import { NextResponse } from "next/server";
import { Trip } from "@/models/Trip";
import { Activity } from "@/models/Activity";
import { Expense } from "@/models/Expense";
import { ChecklistItem } from "@/models/ChecklistItem";
import { bodyOf, currentUserId, handleError, ownerOnly, tripAccess } from "@/lib/api";
import { tripPatchSchema } from "@/lib/schemas";
type C = { params: Promise<{ id: string }> };
export async function GET(
    _req: Request,
    { params }: C) {
    try {
        const { id } = await params;
        return NextResponse.json(await tripAccess(id, await currentUserId()));
    } catch (e) {
        return handleError(e);
    }
}
export async function PATCH(
    req: Request,
    { params }: C) {
    try {

        const { id } = await params;
        const userId = await currentUserId();
        const trip = await tripAccess(id, userId);

        ownerOnly(trip, userId);

        const data = await bodyOf(req, tripPatchSchema);
        const startDate = data.startDate ?? trip.startDate;
        const endDate = data.endDate ?? trip.endDate;

        if (new Date(endDate) < new Date(startDate))
            return NextResponse.json({
                error: "Datas inválidas"
            }, {
                status: 400
            }
            );
        Object.assign(trip, data);
        
        await trip.save();
        return NextResponse.json(trip);
    } catch (e) {
        return handleError(e);
    }
}
export async function DELETE(
    _req: Request,
    { params }: C) {
    try {

        const { id } = await params;
        const userId = await currentUserId();
        const trip = await tripAccess(id, userId);

        ownerOnly(trip, userId);

        await Promise.all([Activity.deleteMany({ trip: id }),
        Expense.deleteMany({ trip: id }),
        ChecklistItem.deleteMany({ trip: id })]);

        await Trip.deleteOne({ _id: id });

        return NextResponse.json({ message: "Viagem excluída" });

    } catch (e) {
        return handleError(e);
    }
}
