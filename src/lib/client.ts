import { useMutation, useQueryClient } from "@tanstack/react-query";

export type Person = { _id: string; name: string; email: string };
export type Trip = { _id: string; title: string; destination: string; description: string; startDate: string; endDate: string; owner: string; participants: string[] };
export type Activity = { _id: string; title: string; location: string; startsAt: string; endsAt?: string | null; notes: string };
export type Expense = { _id: string; title: string; amountCents: number; paidBy: string; splitAmong: string[]; spentAt: string };
export type Item = { _id: string; title: string; assignedTo: string | null; checked: boolean };
export type Balance = { totalCents: number; participants: { userId: string; paidCents: number; owedCents: number; balanceCents: number }[] };

export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Algo deu errado. Tente de novo.");
  return data as T;
}

export const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** "12,50" | "1.250,00" | "12.5" -> centavos (NaN se inválido) */
export function toCents(text: string) {
  const t = text.trim().replace(/[^\d.,]/g, "");
  const n = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  return Math.round(parseFloat(n) * 100);
}

// Datas de viagem vêm em UTC (meia-noite): formatar em UTC evita "voltar um dia" no Brasil.
export const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
const pad = (n: number) => String(n).padStart(2, "0");
/** ISO -> valor de <input type="date"> / <input type="time"> no fuso local */
export const dateInput = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const timeInput = (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const fmtTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function daysLabel(start: string, end: string) {
  const now = Date.now(), s = new Date(start).getTime(), e = new Date(end).getTime() + 864e5;
  if (now < s) { const n = Math.ceil((s - now) / 864e5); return `Faltam ${n} ${n === 1 ? "dia" : "dias"}`; }
  return now <= e ? "Rolando agora!" : "Viagem concluída";
}

/** Sugestão de "quem paga quem" a partir dos saldos (só visual, o back não registra pagamentos). */
export function settle(rows: Balance["participants"]) {
  const debtors = rows.filter(r => r.balanceCents < 0).map(r => ({ id: r.userId, v: -r.balanceCents })).sort((a, b) => b.v - a.v);
  const creditors = rows.filter(r => r.balanceCents > 0).map(r => ({ id: r.userId, v: r.balanceCents })).sort((a, b) => b.v - a.v);
  const out: { from: string; to: string; cents: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const x = Math.min(debtors[i].v, creditors[j].v);
    out.push({ from: debtors[i].id, to: creditors[j].id, cents: x });
    debtors[i].v -= x; creditors[j].v -= x;
    if (!debtors[i].v) i++;
    if (!creditors[j].v) j++;
  }
  return out;
}

/** Mutação padrão da viagem: após salvar, recarrega tudo que pertence a ela. */
export function useTripMutation(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { url: string; method?: "POST" | "PATCH" | "DELETE"; body?: unknown }) =>
      api(`/api/trips/${tripId}${v.url}`, { method: v.method ?? "POST", body: v.body === undefined ? undefined : JSON.stringify(v.body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["t", tripId] }),
  });
}
