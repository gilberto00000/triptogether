"use client";
import { useState } from "react";
import { brl, fmtDate, settle, toCents, useTripMutation, type Balance, type Expense, type Person } from "@/lib/client";
import { Avatar, Empty, ErrorText, Field, FormActions, Icon, Modal, Skeleton } from "@/components/ui";

function Painel({ bal, members }: { bal: Balance; members: Person[] }) {
  const name = (uid: string) => members.find(p => p._id === uid)?.name ?? "Alguém";
  const max = Math.max(1, ...bal.participants.map(r => Math.max(r.paidCents, r.owedCents)));
  const transfers = settle(bal.participants);

  return (
    <section aria-label="Painel de despesas" className="card overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-sea-700 to-sea-500 p-5 text-white">
        <div>
          <p className="font-bold text-sea-100">Total gasto pelo grupo</p>
          <p className="font-display text-4xl">{brl(bal.totalCents)}</p>
        </div>
        <span className="float grid h-16 w-16 place-items-center rounded-2xl bg-white/20"><Icon name="cash" className="h-9 w-9" /></span>
      </div>
      <ul className="grid gap-3 p-4 sm:grid-cols-2">
        {bal.participants.map(r => {
          const status = r.balanceCents > 0
            ? { text: `Recebe ${brl(r.balanceCents)}`, cls: "bg-mint/15 text-mint" }
            : r.balanceCents < 0 ? { text: `Deve ${brl(-r.balanceCents)}`, cls: "bg-coral/15 text-coral" }
            : { text: "Quite", cls: "bg-sea-100 text-sea-700" };
          return (
            <li key={r.userId} className="rounded-2xl border-2 border-sea-100 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Avatar name={name(r.userId)} size={36} />
                <span className="flex-1 truncate font-bold text-sea-800">{name(r.userId)}</span>
                <span className={`chip ${status.cls}`}>{status.text}</span>
              </div>
              {([["Pagou", r.paidCents, "bg-sea-500"], ["Sua parte", r.owedCents, "bg-sun"]] as const).map(([label, v, color]) => (
                <div key={label} className="mb-1.5">
                  <div className="flex justify-between text-sm font-bold text-sea-700"><span>{label}</span><span>{brl(v)}</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sea-100"><div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${(v / max) * 100}%` }} /></div>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
      <div className="border-t-2 border-dashed border-sea-100 bg-sea-50/60 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-display text-lg text-sea-800"><Icon name="swap" className="h-5 w-5 text-sea-500" /> Para ficar tudo certo</h3>
        {transfers.length === 0 ? <p className="text-sea-700">Ninguém deve nada a ninguém por enquanto.</p> : (
          <ul className="grid gap-2">
            {transfers.map((t, i) => (
              <li key={i} className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white px-3 py-2 font-bold text-sea-800">
                <span className="text-coral">{name(t.from)}</span> paga <span className="chip bg-sun text-sea-900">{brl(t.cents)}</span> para <span className="text-mint">{name(t.to)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-sea-700">Sugestão para acertar com o menor número de pagamentos. O app ainda não registra quem já pagou.</p>
      </div>
    </section>
  );
}

function ExpenseForm({ id, me, members, item, onDone }: { id: string; me: string; members: Person[]; item?: Expense; onDone: () => void }) {
  const [error, setError] = useState("");
  const m = useTripMutation(id);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amountCents = toCents(String(f.get("amount")));
    const splitAmong = f.getAll("split").map(String);
    if (!Number.isFinite(amountCents) || amountCents <= 0) return setError("Informe um valor válido, como 45,90.");
    if (!splitAmong.length) return setError("Escolha ao menos uma pessoa para dividir.");
    setError("");
    m.mutate({
      url: item ? `/expenses/${item._id}` : "/expenses", method: item ? "PATCH" : "POST",
      body: { title: f.get("title"), amountCents, paidBy: f.get("paidBy"), splitAmong },
    }, { onSuccess: onDone, onError: err => setError(err.message) });
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Com o que foi?"><input className="input" name="title" defaultValue={item?.title} placeholder="Jantar, hospedagem, gasolina..." required minLength={2} /></Field>
      <Field label="Valor (R$)"><input className="input" name="amount" inputMode="decimal" defaultValue={item ? (item.amountCents / 100).toFixed(2).replace(".", ",") : ""} placeholder="45,90" required /></Field>
      <Field label="Quem pagou?">
        <select className="input" name="paidBy" defaultValue={item?.paidBy ?? me}>{members.map(p => <option key={p._id} value={p._id}>{p.name}{p._id === me ? " (você)" : ""}</option>)}</select>
      </Field>
      <fieldset>
        <legend className="label">Dividir entre</legend>
        <div className="flex flex-wrap gap-2">
          {members.map(p => (
            <label key={p._id} className="cursor-pointer">
              <input type="checkbox" name="split" value={p._id} defaultChecked={!item || item.splitAmong.includes(p._id)} className="peer sr-only" />
              <span className="chip min-h-10 rounded-lg border border-sea-300 bg-white text-sea-700 transition peer-checked:border-sea-600 peer-checked:bg-sea-600 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-sea-400">{p.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <ErrorText message={error} />
      <FormActions onCancel={onDone} busy={m.isPending} label={item ? "Salvar alterações" : "Registrar despesa"} />
    </form>
  );
}

export function Despesas({ id, me, members, exps, bal, loading }: { id: string; me: string; members: Person[]; exps?: Expense[]; bal?: Balance; loading: boolean }) {
  const [form, setForm] = useState<Expense | "new" | null>(null);
  const m = useTripMutation(id);
  const name = (uid: string) => members.find(p => p._id === uid)?.name ?? "Alguém";
  const close = () => setForm(null);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-sea-900">Despesas</h2>
        <button className="btn-sun" onClick={() => setForm("new")}><Icon name="plus" className="h-5 w-5" /> Despesa</button>
      </div>
      {loading ? <Skeleton className="h-64" /> : bal && <Painel bal={bal} members={members} />}
      {exps?.length === 0 && <Empty icon="wallet" title="Nenhuma despesa ainda" hint="Registre quem pagou e com quem dividir. O painel faz as contas por você." />}
      {!!exps?.length && (
        <ul className="grid gap-2">
          {[...exps].reverse().map(x => (
            <li key={x._id} className="card flex items-center gap-3 p-3">
              <Avatar name={name(x.paidBy)} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-sea-800">{x.title}</p>
                <p className="text-sm text-sea-700">{name(x.paidBy)} pagou · dividido em {x.splitAmong.length} · {fmtDate(x.spentAt)}</p>
              </div>
              <span className="font-display text-lg text-sea-700">{brl(x.amountCents)}</span>
              <button className="btn-ghost" aria-label={`Editar ${x.title}`} onClick={() => setForm(x)}><Icon name="edit" className="h-5 w-5" /></button>
              <button className="btn-ghost" aria-label={`Excluir ${x.title}`} disabled={m.isPending}
                onClick={() => confirm(`Excluir "${x.title}"?`) && m.mutate({ url: `/expenses/${x._id}`, method: "DELETE" })}><Icon name="trash" className="h-5 w-5" /></button>
            </li>
          ))}
        </ul>
      )}
      <Modal open={form !== null} onClose={close} title={form === "new" ? "Nova despesa" : "Editar despesa"}>
        {form && <ExpenseForm key={form === "new" ? "new" : form._id} id={id} me={me} members={members} item={form === "new" ? undefined : form} onDone={close} />}
      </Modal>
    </div>
  );
}
