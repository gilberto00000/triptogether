"use client";
import { useState } from "react";
import { useTripMutation, type Trip } from "@/lib/client";
import { ErrorText, Field, FormActions, Modal } from "@/components/ui";

function TripForm({ trip, onDone }: { trip: Trip; onDone: () => void }) {
  const [error, setError] = useState("");
  const m = useTripMutation(trip._id);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (String(f.endDate) < String(f.startDate)) return setError("A volta precisa ser depois da ida.");
    setError("");
    m.mutate({ url: "", method: "PATCH", body: f }, { onSuccess: onDone, onError: err => setError(err.message) });
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Nome da viagem"><input className="input" name="title" defaultValue={trip.title} required /></Field>
      <Field label="Destino"><input className="input" name="destination" defaultValue={trip.destination} required /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ida"><input className="input" type="date" name="startDate" defaultValue={trip.startDate.slice(0, 10)} required /></Field>
        <Field label="Volta"><input className="input" type="date" name="endDate" defaultValue={trip.endDate.slice(0, 10)} required /></Field>
      </div>
      <Field label="Descrição"><textarea className="input" name="description" defaultValue={trip.description} rows={2} maxLength={1000} /></Field>
      <ErrorText message={error} />
      <FormActions onCancel={onDone} busy={m.isPending} label="Salvar alterações" />
    </form>
  );
}

export function EditTripModal({ trip, open, onClose }: { trip: Trip; open: boolean; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title="Editar viagem">{open && <TripForm trip={trip} onDone={onClose} />}</Modal>;
}
