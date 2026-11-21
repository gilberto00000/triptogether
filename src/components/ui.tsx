"use client";
import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";

const paths: Record<string, string> = {
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  bag: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z"/><path d="M5 20h14"/>',
  alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  swap: '<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
  back: '<path d="m12 19-7-7 7-7M19 12H5"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3Z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
  cloud: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2M16 14v6M8 14v6M12 16v6"/>',
};

export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof paths | string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 ${className}`} dangerouslySetInnerHTML={{ __html: paths[name] ?? "" }} />
  );
}

const tints = ["bg-sea-600", "bg-orange", "bg-sea-800", "bg-coral", "bg-sea-500", "bg-sea-700"];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const tint = tints[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % tints.length];
  return (
    <span aria-hidden style={{ width: size, height: size, fontSize: size * 0.45 }}
      className={`grid shrink-0 place-items-center rounded-full font-display font-semibold text-white ring-2 ring-white ${tint}`}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

let scrollLocks = 0;
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement: html } = document;
    if (scrollLocks++ === 0) {
      const gap = window.innerWidth - html.clientWidth;
      html.style.overflow = body.style.overflow = "hidden";
      if (gap > 0) body.style.paddingRight = `${gap}px`;
    }
    return () => { if (--scrollLocks === 0) html.style.overflow = body.style.overflow = body.style.paddingRight = ""; };
  }, [active]);
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Modal em portal (direto no body): fica sempre acima de tudo, trava a rolagem e prende o foco do teclado. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const nodes = () => [...(box.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    (box.current?.querySelector<HTMLElement>("input,select,textarea") ?? nodes()[0])?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const list = nodes();
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1], active = document.activeElement;
      if (!box.current?.contains(active)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-end overflow-hidden overscroll-contain bg-night/70 backdrop-blur-sm sm:place-items-center sm:p-4">
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby={id} className="pop card flex max-h-[92dvh] w-full max-w-md flex-col rounded-b-none sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-sea-200 px-5 py-3">
          <h2 id={id} className="font-display text-xl text-sea-800">{title}</h2>
          <button type="button" className="btn-ghost -mr-2" aria-label="Fechar" onClick={onClose}><Icon name="x" className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}

export function ErrorText({ message }: { message?: string }) {
  return message ? <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200"><Icon name="alert" className="h-4 w-4" />{message}</p> : null;
}

export function Empty({ icon, title, hint, action }: { icon: string; title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="rise grid place-items-center gap-2 rounded-xl border border-dashed border-sea-400/70 bg-white/60 px-6 py-10 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-sea-100 text-sea-600"><Icon name={icon} className="h-9 w-9" /></span>
      <h3 className="font-display text-xl text-sea-900">{title}</h3>
      <p className="max-w-xs text-sea-700">{hint}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = "h-28" }: { className?: string }) {
  return <div role="status" aria-label="Carregando" className={`animate-pulse rounded-xl bg-white/60 ${className}`} />;
}

export function FormActions({ onCancel, busy, label }: { onCancel: () => void; busy: boolean; label: string }) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="button" className="btn-outline" onClick={onCancel}>Cancelar</button>
      <button className="btn-sun flex-1" disabled={busy}>{busy ? "Salvando..." : label}</button>
    </div>
  );
}

export function PasswordInput({ label, ...props }: { label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input id={id} {...props} type={show ? "text" : "password"} className="input pr-12" />
        <button type="button" aria-label={show ? "Ocultar senha" : "Mostrar senha"} aria-pressed={show} onClick={() => setShow(v => !v)}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-sea-600 transition hover:bg-sea-100">
          <Icon name={show ? "eyeoff" : "eye"} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** Linhas finas decorativas (órbitas), usadas como detalhe de fundo. */
export function Orbits({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth={1.2} className={className}>
      <ellipse cx="200" cy="150" rx="190" ry="100" transform="rotate(-18 200 150)" />
      <ellipse cx="200" cy="150" rx="150" ry="68" transform="rotate(14 200 150)" />
      <circle cx="200" cy="150" r="62" />
    </svg>
  );
}
