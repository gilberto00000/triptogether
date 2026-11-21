"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <main className="p-8"><p>Não foi possível carregar esta página.</p><button className="underline" onClick={() => reset()}>Tentar novamente</button></main>; }
