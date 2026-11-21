"use client";
import { useState } from "react";
import { useTripMutation, type Item, type Person } from "@/lib/client";
import { Empty, ErrorText, Field, FormActions, Icon, Modal, Skeleton } from "@/components/ui";

function ItemForm({ id, members, item, onDone }: { id: string; members: Person[]; item: Item; onDone: () => void }) {
  const [error, setError] = useState("");
  const m = useTripMutation(id);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    m.mutate({ url: `/checklist/${item._id}`, method: "PATCH", body: { title: f.get("title"), assignedTo: String(f.get("assignedTo") || "") || null } },
      { onSuccess: onDone, onError: err => setError(err.message) });
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Item"><input className="input" name="title" defaultValue={item.title} required /></Field>
      <Field label="Quem leva?">
        <select className="input" name="assignedTo" defaultValue={item.assignedTo ?? ""}><option value="">Qualquer um</option>{members.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
      </Field>
      <ErrorText message={error} />
      <FormActions onCancel={onDone} busy={m.isPending} label="Salvar alterações" />
    </form>
  );
}

export function Mala({ id, members, items, loading }: { id: string; members: Person[]; items?: Item[]; loading: boolean }) {
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const m = useTripMutation(id);
  const done = items?.filter(i => i.checked).length ?? 0, total = items?.length ?? 0;
  const who = (uid: string | null) => members.find(p => p._id === uid)?.name;

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    setError("");
    m.mutate({ url: "/checklist", body: { title: f.get("title"), assignedTo: String(f.get("assignedTo") || "") || null } }, { onSuccess: () => form.reset(), onError: err => setError(err.message) });
  }

  return (
    <div className="grid gap-4">
      <h2 className="font-display text-2xl text-sea-900">O que levar</h2>
      <form onSubmit={add} className="card grid gap-2 p-3 sm:grid-cols-[1fr_auto_auto]">
        <input className="input" name="title" placeholder="Protetor solar, carregador..." aria-label="Novo item" required />
        <select className="input" name="assignedTo" aria-label="Quem leva" defaultValue=""><option value="">Qualquer um</option>{members.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
        <button className="btn-primary" disabled={m.isPending}><Icon name="plus" className="h-5 w-5" /> Adicionar</button>
      </form>
      <ErrorText message={error} />
      {loading && <Skeleton />}
      {items?.length === 0 && <Empty icon="bag" title="Mala vazia" hint="Liste o que levar e combine quem fica responsável por cada coisa." />}
      {total > 0 && (
        <div>
          <div className="mb-1 flex justify-between text-sm font-bold text-sea-800"><span>Mala pronta</span><span>{done}/{total}</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-white/70" role="progressbar" aria-valuenow={done} aria-valuemax={total} aria-label="Progresso da mala">
            <div className="h-full rounded-full bg-gradient-to-r from-sea-500 to-sun transition-all duration-500" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          {done === total && <p className="mt-2 font-bold text-sea-700">Tudo pronto, bora viajar!</p>}
        </div>
      )}
      <ul className="grid gap-2">
        {items?.map(i => (
          <li key={i._id} className="card flex items-center gap-1 p-2 pr-1">
            <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg px-2">
              <input type="checkbox" className="peer sr-only" checked={i.checked} onChange={() => m.mutate({ url: `/checklist/${i._id}`, method: "PATCH", body: { checked: !i.checked } })} />
              <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-sea-300 bg-white text-white transition peer-checked:border-sea-600 peer-checked:bg-sea-600 peer-focus-visible:outline-3 peer-focus-visible:outline-sea-400">{i.checked && <Icon name="check" className="h-4 w-4" />}</span>
              <span className={`truncate font-bold ${i.checked ? "text-sea-400 line-through" : "text-sea-800"}`}>{i.title}</span>
              {who(i.assignedTo) && <span className="chip ml-auto shrink-0 bg-sea-100 text-sea-700"><Icon name="user" className="h-4 w-4" /> {who(i.assignedTo)}</span>}
            </label>
            <button className="btn-ghost" aria-label={`Editar ${i.title}`} onClick={() => setEditing(i)}><Icon name="edit" className="h-5 w-5" /></button>
            <button className="btn-ghost" aria-label={`Excluir ${i.title}`} onClick={() => m.mutate({ url: `/checklist/${i._id}`, method: "DELETE" })}><Icon name="trash" className="h-5 w-5" /></button>
          </li>
        ))}
      </ul>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar item">
        {editing && <ItemForm key={editing._id} id={id} members={members} item={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
