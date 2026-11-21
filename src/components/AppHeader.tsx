"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, Icon } from "@/components/ui";

export function AppHeader() {
  const { data } = useSession();
  const name = data?.user?.name ?? "";
  return (
    <header className="sticky top-0 z-40 border-b border-sea-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/trips" className="flex items-center gap-2 font-display text-xl text-sea-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sea-600 text-white"><Icon name="compass" className="h-5 w-5" /></span>
          <span>Trip<span className="text-sea-600">Together</span></span>
        </Link>
        <div className="flex items-center gap-2">
          {name && <><Avatar name={name} size={34} /><span className="hidden font-semibold text-sea-900 sm:inline">{name.split(" ")[0]}</span></>}
          <button className="btn-ghost" onClick={() => signOut({ callbackUrl: "/login" })}>Sair</button>
        </div>
      </div>
    </header>
  );
}
