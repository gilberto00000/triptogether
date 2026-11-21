"use client";
import { Icon } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-sm p-8 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sea-100 text-sea-500"><Icon name="cloud" className="h-9 w-9" /></span>
      <h1 className="mt-3 font-display text-2xl text-sea-800">Opa, algo deu errado</h1>
      <p className="mb-4 text-sea-700">Não foi possível carregar esta página.</p>
      <button className="btn-primary" onClick={() => reset()}>Tentar novamente</button>
    </div>
  );
}
