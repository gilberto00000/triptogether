import Link from "next/link";
import { Avatar, Icon, Orbits } from "@/components/ui";

const perks = [
  ["map", "Roteiro dia a dia", "Passeios com data e hora organizados numa linha do tempo.", "bg-sea-600 text-white"],
  ["wallet", "Contas sem briga", "Veja quanto cada um gastou e quem deve a quem.", "bg-orange text-white"],
  ["bag", "Lista de mala", "Todo mundo sabe o que levar e quem leva.", "bg-sun text-sea-900"],
];
const rows = [
  ["Ana", "Recebe R$ 300,00", "bg-sea-100 text-sea-700"],
  ["Bruno", "Quite", "bg-sea-100 text-sea-700"],
  ["Carla", "Deve R$ 300,00", "bg-coral/15 text-coral"],
];

export default function Home() {
  return (
    <>
      <div className="bg-sea-600 px-4 py-2 text-center text-sm font-semibold text-white">Planeje junto. Divida justo. Viaje sem estresse.</div>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="rise">
            <p className="eyebrow text-sea-700">Planejamento de viagens em grupo</p>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] text-sea-900 sm:text-6xl">
              Viaje junto.<br />Divida <mark className="rounded-lg bg-sun px-2 text-sea-900">sem drama</mark>.
            </h1>
            <p className="mt-5 max-w-md text-lg text-sea-800">Monte o roteiro, registre as despesas e crie a lista de mala com seus amigos, tudo num lugar só.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login?modo=cadastro" className="btn-sun">Criar minha conta</Link>
              <Link href="/login" className="btn-outline">Já tenho conta</Link>
            </div>
          </div>

          <div aria-hidden className="relative mx-auto w-full max-w-md pb-14">
            <span className="absolute -left-5 top-10 h-16 w-16 rounded-full bg-sun" />
            <span className="absolute -right-3 top-40 h-10 w-10 rounded-full bg-orange" />
            <div className="relative overflow-hidden rounded-2xl bg-sea-600 p-6 pb-24 text-white shadow-xl shadow-sea-900/25">
              <Orbits className="absolute -right-10 -top-8 w-[115%] text-white/30" />
              <p className="eyebrow relative text-sea-100">Painel de despesas</p>
              <p className="relative mt-1 font-display text-4xl">R$ 1.200,00</p>
              <p className="relative text-sea-100">gasto pelo grupo</p>
            </div>
            <ul className="card absolute inset-x-5 bottom-0 grid gap-2 p-3">
              {rows.map(([name, status, cls]) => (
                <li key={name} className="flex items-center gap-2">
                  <Avatar name={name} size={32} />
                  <span className="flex-1 font-semibold">{name}</span>
                  <span className={`chip ${cls}`}>{status}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:grid-cols-3">
          {perks.map(([icon, title, text, tile], i) => (
            <div key={title} className="card rise p-6" style={{ animationDelay: `${i * 90}ms` }}>
              <span className={`grid h-12 w-12 place-items-center rounded-lg ${tile}`}><Icon name={icon} className="h-6 w-6" /></span>
              <h2 className="mt-4 font-display text-xl">{title}</h2>
              <p className="mt-1 text-sea-800">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
