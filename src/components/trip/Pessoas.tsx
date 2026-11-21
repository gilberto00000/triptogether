"use client";
import { useState } from "react";
import { useTripMutation, type Person } from "@/lib/client";
import { Avatar, ErrorText, Field, FormActions, Icon, Modal } from "@/components/ui";

function InviteForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [error, setError] = useState("");
  const m = useTripMutation(id);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    m.mutate({ url: "/participants", body: { email: new FormData(e.currentTarget).get("email") } }, { onSuccess: onDone, onError: err => setError(err.message) });
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="E-mail do amigo"><input className="input" type="email" name="email" placeholder="amigo@email.com" required /></Field>
      <p className="text-sm text-sea-700">Seu amigo precisa já ter uma conta no TripTogether.</p>
      <ErrorText message={error} />
      <FormActions onCancel={onDone} busy={m.isPending} label="Adicionar à viagem" />
    </form>
  );
}

export function Pessoas({ id, members, ownerId, isOwner }: { id: string; members: Person[]; ownerId: string; isOwner: boolean }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const m = useTripMutation(id);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-sea-900">Quem vai junto</h2>
        {isOwner && <button className="btn-sun" onClick={() => setOpen(true)}><Icon name="plus" className="h-5 w-5" /> Convidar</button>}
      </div>
      {!isOwner && <p className="rounded-lg bg-white/70 px-4 py-2 text-sea-800">Só o organizador pode adicionar ou remover pessoas.</p>}
      <ErrorText message={error} />
      <ul className="grid gap-2 sm:grid-cols-2">
        {members.map(p => (
          <li key={p._id} className="card flex items-center gap-3 p-3">
            <Avatar name={p.name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-sea-800">{p.name}</p>
              <p className="truncate text-sm text-sea-700">{p.email}</p>
            </div>
            {p._id === ownerId
              ? <span className="chip bg-sun text-sea-900"><Icon name="crown" className="h-4 w-4" /> Organizador</span>
              : isOwner && (
                <button className="btn-ghost" aria-label={`Remover ${p.name}`} disabled={m.isPending}
                  onClick={() => { setError(""); confirm(`Remover ${p.name} da viagem?`) && m.mutate({ url: `/participants/${p._id}`, method: "DELETE" }, { onError: err => setError(err.message) }); }}>
                  <Icon name="trash" className="h-5 w-5" />
                </button>
              )}
          </li>
        ))}
      </ul>
      <Modal open={open} onClose={() => setOpen(false)} title="Convidar pessoa">{open && <InviteForm id={id} onDone={() => setOpen(false)} />}</Modal>
    </div>
  );
}
