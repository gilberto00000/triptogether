"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { api, daysLabel, fmtDate, type Trip } from "@/lib/client";
import { useUiStore } from "@/store/ui";
import { Empty, ErrorText, Field, FormActions, Icon, Modal, Skeleton } from "@/components/ui";

const covers = ["from-sea-600 to-sea-800", "from-sea-500 to-sea-700", "from-sea-700 to-sea-900", "from-sea-400 to-sea-600"];
const icons = ["sun", "map", "compass", "plane", "pin", "bag"];

function NewTripModal() {
  const { createTripOpen, setCreateTripOpen } = useUiStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true); setError("");
    try {
      const trip = await api<Trip>("/api/trips", { method: "POST", body: JSON.stringify(f) });
      await qc.invalidateQueries({ queryKey: ["trips"] });
      setCreateTripOpen(false);
      router.push(`/trips/${trip._id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Erro"); }
    setBusy(false);
  }

  return (
    <Modal open={createTripOpen} onClose={() => setCreateTripOpen(false)} title="Nova viagem">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Nome da viagem"><input className="input" name="title" placeholder="Férias com a galera" required /></Field>
        <Field label="Destino"><input className="input" name="destination" placeholder="Recife, PE" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ida"><input className="input" type="date" name="startDate" required /></Field>
          <Field label="Volta"><input className="input" type="date" name="endDate" required /></Field>
        </div>
        <Field label="Descrição (opcional)"><textarea className="input" name="description" rows={2} maxLength={1000} /></Field>
        <ErrorText message={error} />
        <FormActions onCancel={() => setCreateTripOpen(false)} busy={busy} label="Criar viagem" />
      </form>
    </Modal>
  );
}

export default function TripsPage() {
  const { data: session } = useSession();
  const setOpen = useUiStore(s => s.setCreateTripOpen);
  const { data: trips, isLoading, error, refetch } = useQuery({ queryKey: ["trips"], queryFn: () => api<Trip[]>("/api/trips") });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-sea-900">Olá, {session?.user?.name?.split(" ")[0] ?? "viajante"}!</h1>
          <p className="text-sea-800">Para onde vamos agora?</p>
        </div>
        <button className="btn-sun" onClick={() => setOpen(true)}><Icon name="plus" className="h-5 w-5" /> Nova viagem</button>
      </div>

      {isLoading && <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-44" /><Skeleton className="h-44" /></div>}
      {error && <div className="grid gap-2"><ErrorText message={(error as Error).message} /><button className="btn-outline w-fit" onClick={() => refetch()}>Tentar de novo</button></div>}
      {trips?.length === 0 && (
        <Empty icon="bag" title="Nenhuma viagem por aqui ainda" hint="Crie a primeira e convide os amigos para planejar juntos."
          action={<button className="btn-primary mt-2" onClick={() => setOpen(true)}>Criar primeira viagem</button>} />
      )}
      <ul className="grid gap-5 sm:grid-cols-2">
        {trips?.map((t, i) => (
          <li key={t._id} className="rise" style={{ animationDelay: `${i * 70}ms` }}>
            <Link href={`/trips/${t._id}`} className="card group block overflow-hidden transition hover:-translate-y-1">
              <div className={`flex items-center justify-between bg-gradient-to-br p-4 text-white ${covers[i % covers.length]}`}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 transition group-hover:scale-110"><Icon name={icons[i % icons.length]} className="h-7 w-7" /></span>
                <span className="chip bg-sun text-sea-900">{daysLabel(t.startDate, t.endDate)}</span>
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl text-sea-800">{t.title}</h2>
                <p className="flex items-center gap-1 text-sea-700"><Icon name="pin" className="h-4 w-4" /> {t.destination}</p>
                <p className="mt-2 flex flex-wrap gap-2 text-sm font-bold">
                  <span className="chip bg-sea-100 text-sea-700"><Icon name="calendar" className="h-4 w-4" /> {fmtDate(t.startDate)} → {fmtDate(t.endDate)}</span>
                  <span className="chip bg-sea-100 text-sea-700"><Icon name="users" className="h-4 w-4" /> {t.participants.length}</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <NewTripModal />
    </>
  );
}
