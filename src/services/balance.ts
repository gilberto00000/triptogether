type ExpenseInput = { amountCents: number; paidBy: unknown; splitAmong: unknown[] };
export function calculateBalances(participantIds: string[], expenses: ExpenseInput[]) {
  const balances = new Map(participantIds.map(id => [id, { userId: id, paidCents: 0, owedCents: 0, balanceCents: 0 }]));
  for (const expense of expenses) {
    const payer = balances.get(String(expense.paidBy));
    if (!payer || !expense.splitAmong.length) continue;
    payer.paidCents += expense.amountCents;
    const people = expense.splitAmong.map(String).sort();
    const base = Math.floor(expense.amountCents / people.length);
    const remainder = expense.amountCents % people.length;
    people.forEach((id, i) => { const entry = balances.get(id); if (entry) entry.owedCents += base + (i < remainder ? 1 : 0); });
  }
  return [...balances.values()].map(row => ({ ...row, balanceCents: row.paidCents - row.owedCents }));
}
