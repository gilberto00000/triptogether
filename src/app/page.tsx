import Link from "next/link";
export default function Home() { return <main className="mx-auto max-w-3xl p-10"><h1 className="text-4xl font-bold">TripTogether</h1><p className="mt-3">Organize viagens, passeios e despesas em grupo.</p><Link className="mt-6 inline-block underline" href="/trips">Minhas viagens</Link></main>; }
