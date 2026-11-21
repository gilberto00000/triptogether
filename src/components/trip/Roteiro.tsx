"use client";
import { useState } from "react";
import { dateInput, fmtTime, timeInput, useTripMutation, type Activity } from "@/lib/client";
import { Empty, ErrorText, Field, FormActions, Icon, Modal, Skeleton } from "@/components/ui";

function ActivityForm({ id, item, start, end, onDone }: { id: string; item?: Activity; start: string; end: string; onDone: () => void }) {
  const [error, setError] = useState("");
  const m = useTripMutation(id);
  const min = start.slice(0, 10), max = end.slice(0, 10);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const date = String(f.get("date")), from = String(f.get("from")), to = String(f.get("to") || "");
    const startsAt = new Date(`${date}T${from}`), endsAt = to ? new Date(`${date}T${to}`) : null;
    if (endsAt && endsAt <= startsAt) return setError("O horário de término precisa ser depois do início.");
    setError("");
    m.mutate({
      url: item ? `/activities/${item._id}` : "/activities", method: item ? "PATCH" : "POST",
      body: { title: f.get("title"), location: f.get("location"), notes: f.get("notes"), startsAt: startsAt.toISOString(), endsAt: endsAt ? endsAt.toISOString() : null },
    }, { onSuccess: onDone, onError: err => setError(err.message) });
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="O que vamos fazer?"><input className="input" name="title" defaultValue={item?.title} placeholder="Passeio de buggy" required minLength={2} /></Field>
      <Field label="Local"><input className="input" name="location" defaultValue={item?.location} placeholder="Praia de Boa Viagem" /></Field>
      <Field label="Data"><input className="input" type="date" name="date" min={min} max={max} defaultValue={item ? dateInput(item.startsAt) : min} required /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hora de início"><input className="input" type="time" name="from" defaultValue={item ? timeInput(item.startsAt) : ""} required /></Field>
        <Field label="Término (opcional)"><input className="input" type="time" name="to" defaultValue={item?.endsAt ? timeInput(item.endsAt) : ""} /></Field>
      </div>
      <Field label="Observações"><textarea className="input" name="notes" defaultValue={item?.notes} rows={2} maxLength={1000} /></Field>
      <ErrorText message={error} />
      <FormActions onCancel={onDone} busy={m.isPending} label={item ? "Salvar alterações" : "Adicionar ao roteiro"} />
    </form>
  );
}

export function Roteiro({ id, acts, loading, start, end }: { id: string; acts?: Activity[]; loading: boolean; start: string; end: string }) {
  const [form, setForm] = useState<Activity | "new" | null>(null);
  const m = useTripMutation(id);
  const close = () => setForm(null);

  const days = new Map<string, Activity[]>();
  acts?.forEach(a => {
    const key = new Date(a.startsAt).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    days.set(key, [...(days.get(key) ?? []), a]);
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-sea-900">Roteiro</h2>
        <button className="btn-sun" onClick={() => setForm("new")}><Icon name="plus" className="h-5 w-5" /> Passeio</button>
      </div>
      {loading && <Skeleton />}
      {acts?.length === 0 && <Empty icon="map" title="Roteiro em branco" hint="Adicione passeios com data e hora e o cronograma se monta sozinho." />}
      {[...days].map(([day, items]) => (
        <div key={day}>
          <h3 className="mb-2 flex items-center gap-2 font-display text-lg capitalize text-sea-800"><Icon name="calendar" className="h-5 w-5" /> {day}</h3>
          <ol className="ml-3 grid gap-3 border-l-2 border-sea-400/60 pl-5">
            {items.map(a => (
              <li key={a._id} className="card relative p-4">
                <span aria-hidden className="absolute -left-[29px] top-5 h-4 w-4 rounded-full border-4 border-white bg-sea-600" />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="chip mb-1 bg-sea-100 text-sea-700"><Icon name="clock" className="h-4 w-4" /> {fmtTime(a.startsAt)}{a.endsAt ? ` – ${fmtTime(a.endsAt)}` : ""}</p>
                    <h4 className="font-display text-lg text-sea-800">{a.title}</h4>
                    {a.location && <p className="flex items-center gap-1 text-sea-700"><Icon name="pin" className="h-4 w-4" /> {a.location}</p>}
                    {a.notes && <p className="mt-1 text-sm text-sea-700">{a.notes}</p>}
                  </div>
                  <div className="flex shrink-0">
                    <button className="btn-ghost" aria-label={`Editar ${a.title}`} onClick={() => setForm(a)}><Icon name="edit" className="h-5 w-5" /></button>
                    <button className="btn-ghost" aria-label={`Excluir ${a.title}`} disabled={m.isPending}
                      onClick={() => confirm(`Excluir "${a.title}"?`) && m.mutate({ url: `/activities/${a._id}`, method: "DELETE" })}><Icon name="trash" className="h-5 w-5" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <Modal open={form !== null} onClose={close} title={form === "new" ? "Novo passeio" : "Editar passeio"}>
        {form && <ActivityForm key={form === "new" ? "new" : form._id} id={id} item={form === "new" ? undefined : form} start={start} end={end} onDone={close} />}
      </Modal>
    </div>
  );
}
