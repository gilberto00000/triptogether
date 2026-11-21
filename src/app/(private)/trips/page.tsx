import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Trip } from "@/models/Trip";
import Link from "next/link";
export default async function TripsPage() { const session = await getServerSession(authOptions); await dbConnect(); const trips = await Trip.find({ participants: session!.user.id }).sort({ startDate: 1 }).lean(); return <main className="mx-auto max-w-3xl p-8"><h1 className="text-3xl font-bold">Minhas viagens</h1><ul className="mt-6 space-y-3">{trips.map(trip => <li key={String(trip._id)} className="rounded border p-4"><Link className="underline" href={`/trips/${trip._id}`}>{trip.title} — {trip.destination}</Link></li>)}</ul><p className="mt-6 text-sm">A API REST está pronta para integração com os formulários do grupo.</p></main>; }
