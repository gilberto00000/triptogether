"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/client";
import { ErrorText, Field, Icon, PasswordInput } from "@/components/ui";

function AuthForm() {
  const router = useRouter();
  const [signup, setSignup] = useState(useSearchParams().get("modo") === "cadastro");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")), password = String(f.get("password"));
    setBusy(true); setError("");
    try {
      if (signup) await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: f.get("name"), email, password }) });
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error(res.error === "CredentialsSignin" ? "E-mail ou senha incorretos." : res.error);
      router.push("/trips");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="pop w-full max-w-sm">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-2 font-display text-3xl text-sea-900">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-sea-600 text-white"><Icon name="compass" className="h-6 w-6" /></span> Trip<span className="text-sea-600">Together</span>
        </Link>
        <div className="card p-6">
          <h1 className="font-display text-2xl text-sea-800">{signup ? "Bora começar!" : "Que bom te ver de novo"}</h1>
          <p className="mb-5 text-sea-700">{signup ? "Crie sua conta para planejar com os amigos." : "Entre para ver suas viagens."}</p>
          <form onSubmit={submit} className="grid gap-4">
            {signup && <Field label="Seu nome"><input className="input" name="name" minLength={2} autoComplete="name" placeholder="Ana Souza" required /></Field>}
            <Field label="E-mail"><input className="input" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required /></Field>
            <PasswordInput label={signup ? "Senha (mín. 8 caracteres)" : "Senha"} name="password" minLength={signup ? 8 : 1} autoComplete={signup ? "new-password" : "current-password"} required />
            <ErrorText message={error} />
            <button className="btn-primary" disabled={busy}>{busy ? "Um instante..." : signup ? "Criar conta" : "Entrar"}</button>
          </form>
        </div>
        <button className="btn-ghost mx-auto mt-4 flex" onClick={() => { setSignup(!signup); setError(""); }}>
          {signup ? "Já tenho conta · Entrar" : "Ainda não tenho conta · Cadastrar"}
        </button>
      </div>
    </main>
  );
}

export default function Login() {
  return <Suspense><AuthForm /></Suspense>;
}
