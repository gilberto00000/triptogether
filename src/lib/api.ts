import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Trip } from "@/models/Trip";
import * as yup from "yup";
export class ApiError extends Error {
    constructor(public status: number,
        message: string) { super(message); }
}
export async function currentUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new ApiError(401, "Não autenticado");
    return session.user.id;
}
export function objectId(id: string) {
    if (!isValidObjectId(id))
        throw new ApiError(400, "ID inválido");
    return id;
}
export async function tripAccess(id: string, userId: string) {
    objectId(id);
    await dbConnect();
    const trip = await Trip.findOne({ _id: id, participants: userId });
    if (!trip) throw new ApiError(404, "Viagem não encontrada ou acesso negado");
    return trip;
}
export function ownerOnly(trip: { owner: { toString(): string } }, userId: string) {
    if (String(trip.owner) !== userId)
        throw new ApiError(403, "Apenas o organizador pode realizar esta ação");
}
export async function bodyOf<T>(req: Request, schema: yup.Schema<T>): Promise<T> {
    let data: unknown;
    try {
        data = await req.json();

    } catch {
        throw new ApiError(400, "JSON inválido");

    } return schema.validate(data, { abortEarly: false, stripUnknown: true });
}
export function handleError(error: unknown) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message },
        { status: error.status });
    if (error instanceof yup.ValidationError)
        return NextResponse.json({ error: error.errors.join("; ") },
            { status: 400 }); console.error(error); return NextResponse.json({ error: "Erro interno" },
                { status: 500 });
}
export const paramsId = (ctx: { params: Promise<{ id: string }> }) => ctx.params;
