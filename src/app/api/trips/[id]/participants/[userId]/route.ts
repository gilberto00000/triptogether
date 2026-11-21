import { NextResponse } from "next/server";
import { ApiError, currentUserId, handleError, objectId, ownerOnly, tripAccess } from "@/lib/api";
import { Expense } from "@/models/Expense";
import { ChecklistItem } from "@/models/ChecklistItem";

type Ctx = { params: Promise<{ id: string; userId: string }> };

// Remove um participante. Só o organizador pode; bloqueia se a pessoa tiver despesas (para não quebrar o saldo).
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id, userId } = await params;
    const me = await currentUserId();
    const trip = await tripAccess(id, me);
    ownerOnly(trip, me);
    objectId(userId);
    if (String(trip.owner) === userId) throw new ApiError(400, "O organizador não pode ser removido da viagem");
    if (!trip.participants.some((p: unknown) => String(p) === userId)) throw new ApiError(404, "Participante não encontrado nesta viagem");
    if (await Expense.exists({ trip: id, $or: [{ paidBy: userId }, { splitAmong: userId }] }))
      throw new ApiError(409, "Esta pessoa tem despesas registradas. Edite ou exclua essas despesas antes de removê-la.");
    await ChecklistItem.updateMany({ trip: id, assignedTo: userId }, { assignedTo: null });
    trip.participants.pull(userId);
    await trip.save();
    return NextResponse.json({ message: "Participante removido" });
  } catch (e) { return handleError(e); }
}
