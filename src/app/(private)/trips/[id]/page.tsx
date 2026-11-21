"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { use, useState } from "react";
import { api, daysLabel, fmtDate, useTripMutation, type Activity, type Balance, type Expense, type Item, type Person, type Trip } from "@/lib/client";
import { Avatar, ErrorText, Icon, Orbits, Skeleton } from "@/components/ui";
import { Roteiro } from "@/components/trip/Roteiro";
import { Despesas } from "@/components/trip/Despesas";
import { Mala } from "@/components/trip/Mala";
import { Pessoas } from "@/components/trip/Pessoas";
import { EditTripModal } from "@/components/trip/EditTrip";

const tabs = [
  { key: "roteiro", label: "Roteiro", icon: "map" },
  { key: "despesas", label: "Despesas", icon: "wallet" },
  { key: "mala", label: "Mala", icon: "bag" },
  { key: "pessoas", label: "Pessoas", icon: "users" },
] as const;

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("roteiro");
  const q = (path: string) => ({ queryKey: ["t", id, path], queryFn: () => api<never>(`/api/trips/${id}${path}`) });
  const trip = useQuery<Trip>(q(""));
  const people = useQuery<Person[]>(q("/participants"));
  const acts = useQuery<Activity[]>(q("/activities"));
  const exps = useQuery<Expense[]>(q("/expenses"));
  const bal = useQuery<Balance>(q("/balance"));
  const list = useQuery<Item[]>(q("/checklist"));
  const del = useTripMutation(id);

  if (trip.error) return <div className="grid gap-3"><ErrorText message={(trip.error as Error).message} /><Link href="/trips" className="btn-primary w-fit"><Icon name="back" className="h-5 w-5" /> Minhas viagens</Link></div>;
  if (!trip.data || !people.data) return <div className="grid gap-4"><Skeleton className="h-40" /><Skeleton className="h-12" /><Skeleton /></div>;

  const t = trip.data, me = session?.user?.id ?? "", isOwner = t.owner === me;
  const members = people.data;

  return (
    <div className="grid gap-5">
      <section className="rise relative overflow-hidden rounded-xl bg-gradient-to-br from-sea-600 to-sea-800 p-5 text-white shadow-xl shadow-sea-900/25 sm:p-7">
        <Orbits className="pointer-events-none absolute -right-20 -top-16 w-[460px] text-white/15" />
        <Link href="/trips" className="inline-flex items-center gap-1 text-sm font-bold text-sea-100 hover:underline"><Icon name="back" className="h-4 w-4" /> Minhas viagens</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">{t.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sea-100"><span className="inline-flex items-center gap-1"><Icon name="pin" className="h-4 w-4" /> {t.destination}</span><span className="inline-flex items-center gap-1"><Icon name="calendar" className="h-4 w-4" /> {fmtDate(t.startDate)} → {fmtDate(t.endDate)}</span></p>
            {t.description && <p className="mt-2 max-w-xl text-sea-50">{t.description}</p>}
          </div>
          <span className="chip bg-sun text-sea-900">{daysLabel(t.startDate, t.endDate)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">{members.slice(0, 6).map(p => <Avatar key={p._id} name={p.name} size={36} />)}</div>
          {isOwner && (
            <div className="flex gap-1">
              <button className="btn-ghost text-white hover:bg-white/10 hover:text-white" onClick={() => setEditing(true)}><Icon name="edit" className="h-5 w-5" /> Editar</button>
              <button className="btn-ghost text-white hover:bg-white/10 hover:text-white" disabled={del.isPending}
                onClick={() => confirm("Excluir esta viagem e tudo dentro dela? Não dá para desfazer.") && del.mutate({ url: "", method: "DELETE" }, { onSuccess: () => router.push("/trips") })}>
                <Icon name="trash" className="h-5 w-5" /> Excluir
              </button>
            </div>
          )}
        </div>
      </section>

      <div role="tablist" aria-label="Seções da viagem" className="card sticky top-[57px] z-30 grid grid-cols-4 gap-1 p-1.5">
        {tabs.map(x => (
          <button key={x.key} role="tab" id={`tab-${x.key}`} aria-selected={tab === x.key} aria-controls="painel" onClick={() => setTab(x.key)}
            className={`flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-lg text-sm font-bold transition sm:flex-row sm:gap-2 sm:text-base ${tab === x.key ? "bg-sea-600 text-white shadow-md shadow-sea-600/25" : "text-sea-700 hover:bg-sea-100"}`}>
            <Icon name={x.icon} className="h-5 w-5" />{x.label}
          </button>
        ))}
      </div>

      <section id="painel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab} className="rise">
        {tab === "roteiro" && <Roteiro id={id} acts={acts.data} loading={acts.isLoading} start={t.startDate} end={t.endDate} />}
        {tab === "despesas" && <Despesas id={id} me={me} members={members} exps={exps.data} bal={bal.data} loading={exps.isLoading || bal.isLoading} />}
        {tab === "mala" && <Mala id={id} members={members} items={list.data} loading={list.isLoading} />}
        {tab === "pessoas" && <Pessoas id={id} members={members} ownerId={t.owner} isOwner={isOwner} />}
      </section>
      <EditTripModal trip={t} open={editing} onClose={() => setEditing(false)} />
    </div>
  );
}
