import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Trip } from "@/models/Trip";
import { notFound } from "next/navigation";
export default async function TripPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const session = await getServerSession(authOptions); await dbConnect(); const trip = /^[0-9a-fA-F]{24}$/.test(id) ? await Trip.findOne({ _id: id, participants: session!.user.id }).lean() : null; if (!trip) notFound(); return <main className="mx-auto max-w-3xl p-8"><h1 className="text-3xl font-bold">{trip.title}</h1><p className="mt-2">Destino: {trip.destination}</p><p>Início: {new Date(trip.startDate).toLocaleDateString("pt-BR")}</p><p>Fim: {new Date(trip.endDate).toLocaleDateString("pt-BR")}</p></main>; }
