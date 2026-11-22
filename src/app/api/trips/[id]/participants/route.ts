import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { bodyOf, currentUserId, handleError, ownerOnly, tripAccess } from "@/lib/api";
import { participantSchema } from "@/lib/schemas";
type C = { params: Promise<{ id: string }> };
export async function GET(
    _req: Request,
    { params }: C) {
    try {
        const { id } = await params;
        const trip = await tripAccess(id, await currentUserId());
        return NextResponse.json(await User.find({
            _id: { $in: trip.participants }
        }
        ).select("name email").lean());
    } catch (e) {
        return handleError(e);
    }
}
export async function POST(
    req: Request,
    { params }: C) {
    try {
        const { id } = await params;
        const userId = await currentUserId();
        const trip = await tripAccess(id, userId);
        ownerOnly(trip, userId);
        const { email } = await bodyOf(req, participantSchema);
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
            return NextResponse.json({ error: "Usuário precisa se cadastrar antes de ser adicionado" },
                { status: 404 });
        if (!trip.participants.some((p: {
            toString(): string
        }) => String(p) === String(user._id))) {
            trip.participants.push(user._id);
            await trip.save();
        }
        return NextResponse.json({ id: String(user._id), name: user.name, email: user.email });
    } catch (e) {
        return handleError(e);
    }
}
