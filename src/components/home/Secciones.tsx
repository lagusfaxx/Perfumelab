import Link from 'next/link';
import { FAMILIA_LIST } from '@/lib/families';

const PASOS = [
  {
    n: '01',
    titulo: 'El Ritual',
    texto:
      'Siete preguntas, una por pantalla. No un formulario: un viaje. Cada respuesta enciende color, sonido y movimiento, y te devuelve un fragmento de quién eres.',
  },
  {
    n: '02',
    titulo: 'La Revelación',
    texto:
      'Tus respuestas se traducen en notas. Aparece tu fragancia con un nombre evocador —que puedes hacer tuyo— y su pirámide olfativa de cabeza, corazón y fondo.',
  },
  {
    n: '03',
    titulo: 'Tu Objeto',
    texto:
      'La preparamos a mano y la enviamos: un frasco único con tu nombre y tu historia. El perfume es el final; la experiencia empieza mucho antes.',
  },
];

export function Secciones() {
  return (
    <>
      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">
          Cómo funciona
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-balance text-center font-serif text-3xl text-ink sm:text-4xl">
          Tres pasos para destilar tu identidad
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PASOS.map((p) => (
            <div key={p.n} className="glass rounded-2xl p-7">
              <span className="font-serif text-3xl text-brass/70">{p.n}</span>
              <h3 className="mt-4 font-serif text-2xl text-ink">{p.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Familias olfativas */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-brass">
          Seis mundos
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-balance text-center font-serif text-3xl text-ink sm:text-4xl">
          Cada familia, un lenguaje propio
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {FAMILIA_LIST.map((f) => (
            <div
              key={f.key}
              className="group relative overflow-hidden rounded-2xl border border-ink/10 p-6 transition-colors hover:border-ink/20"
            >
              <div
                className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-90"
                style={{ background: f.color, opacity: 0.55 }}
              />
              <span
                className="relative inline-block h-3 w-3 rounded-full"
                style={{ background: f.color }}
              />
              <h3 className="relative mt-4 font-serif text-xl text-ink">{f.nombre}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">{f.mood}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-3xl px-5 py-28 text-center sm:px-8">
        <h2 className="text-balance font-serif text-4xl leading-tight text-ink sm:text-5xl">
          ¿Quién eres,
          <span className="text-brass-gradient"> en una fragancia?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-ink-soft">
          Descúbrelo en menos de tres minutos. Sin compromiso, sólo asombro.
        </p>
        <Link
          href="/ritual"
          className="mt-9 inline-block rounded-full bg-brass px-10 py-4 text-base font-medium text-canvas shadow-lg shadow-brass/25 transition-all duration-300 hover:bg-brass-soft hover:shadow-brass/40"
        >
          Comenzar el ritual
        </Link>
      </section>

      <footer className="border-t border-ink/10 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-ink-muted sm:flex-row">
          <span className="font-serif text-base text-ink-soft">Perfume Lab Chile</span>
          <span>© {new Date().getFullYear()} · Hecho a mano en Chile · perfumelabchile.cl</span>
        </div>
      </footer>
    </>
  );
}
