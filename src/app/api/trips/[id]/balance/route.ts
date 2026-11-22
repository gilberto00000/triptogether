import { NextResponse } from "next/server";
import { Expense } from "@/models/Expense";
import { calculateBalances } from "@/services/balance";
import { currentUserId, handleError, tripAccess } from "@/lib/api";

type C = { params: Promise<{ id: string }> };

export async function GET(
    _req: Request, { params }: C) {
    try {
        const { id } = await params;
        const trip = await tripAccess(id, await currentUserId());
        const expenses = await Expense.find({ trip: id }).lean();

        return NextResponse.json(
            {
                currency: "BRL",
                totalCents: expenses.reduce((sum, e) => sum + e.amountCents, 0),
                participants: calculateBalances(trip.participants.map(String),
                    expenses as unknown as Parameters<typeof calculateBalances>[1])
            }
        );
    } catch (e) {
        return handleError(e);
    }
}
