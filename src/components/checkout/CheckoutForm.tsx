'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Field';
import { formatCLP, formatRut, validarRut } from '@/lib/utils';
import { FraganciaCard } from '@/components/fragancia/FraganciaCard';
import { PiramideNotas } from '@/components/fragancia/PiramideNotas';
import { REGIONES_CHILE } from './regiones';
import type { FormatoView, FraganciaView, PackagingView } from './types';

interface Props {
  fragancia: FraganciaView;
  formatos: FormatoView[];
  packaging: PackagingView[];
}

interface CamposCliente {
  clienteNombre: string;
  clienteRut: string;
  clienteEmail: string;
  clienteTelefono: string;
  dirRegion: string;
  dirComuna: string;
  dirCalle: string;
  dirNumero: string;
  dirDepto: string;
  dirReferencias: string;
}

const CAMPOS_INICIALES: CamposCliente = {
  clienteNombre: '',
  clienteRut: '',
  clienteEmail: '',
  clienteTelefono: '',
  dirRegion: '',
  dirComuna: '',
  dirCalle: '',
  dirNumero: '',
  dirDepto: '',
  dirReferencias: '',
};

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutForm({ fragancia, formatos, packaging }: Props) {
  const [formatoId, setFormatoId] = useState<string>(formatos[0]?.id ?? '');
  const [packagingIds, setPackagingIds] = useState<string[]>([]);
  const [campos, setCampos] = useState<CamposCliente>(CAMPOS_INICIALES);
  const [errores, setErrores] = useState<Partial<Record<keyof CamposCliente, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const formatoSel = useMemo(
    () => formatos.find((f) => f.id === formatoId) ?? null,
    [formatos, formatoId]
  );

  const packagingSel = useMemo(
    () => packaging.filter((p) => packagingIds.includes(p.id)),
    [packaging, packagingIds]
  );

  // Concentración derivada del formato elegido → alimenta los medidores.
  const conc = useMemo(() => {
    const n = (formatoSel?.nombre ?? '').toLowerCase();
    if (n.includes('toilette')) return { label: 'Eau de Toilette', intensidad: 0.4, estela: 0.42 };
    if (n.includes('extrait')) return { label: 'Extrait de Parfum', intensidad: 0.9, estela: 0.95 };
    if (n.includes('parfum')) return { label: 'Eau de Parfum', intensidad: 0.72, estela: 0.72 };
    return { label: formatoSel?.nombre?.split('·')[0]?.trim() ?? 'Eau de Parfum', intensidad: 0.6, estela: 0.6 };
  }, [formatoSel]);

  const montoProducto = formatoSel?.precio ?? 0;
  const montoPackaging = packagingSel.reduce((acc, p) => acc + p.precioExtra, 0);
  const montoTotal = montoProducto + montoPackaging;

  function set<K extends keyof CamposCliente>(key: K, value: string) {
    setCampos((c) => ({ ...c, [key]: value }));
    if (errores[key]) setErrores((e) => ({ ...e, [key]: undefined }));
  }

  function togglePackaging(id: string) {
    setPackagingIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  function validar(): boolean {
    const next: Partial<Record<keyof CamposCliente, string>> = {};
    if (!campos.clienteNombre.trim()) next.clienteNombre = 'Ingresa tu nombre.';
    if (!campos.clienteRut.trim()) next.clienteRut = 'Ingresa tu RUT.';
    else if (!validarRut(campos.clienteRut)) next.clienteRut = 'RUT inválido.';
    if (!campos.clienteEmail.trim()) next.clienteEmail = 'Ingresa tu correo.';
    else if (!EMAIL_RE.test(campos.clienteEmail.trim()))
      next.clienteEmail = 'Correo inválido.';
    if (!campos.clienteTelefono.trim()) next.clienteTelefono = 'Ingresa tu teléfono.';
    if (!campos.dirRegion) next.dirRegion = 'Elige una región.';
    if (!campos.dirComuna.trim()) next.dirComuna = 'Ingresa tu comuna.';
    if (!campos.dirCalle.trim()) next.dirCalle = 'Ingresa tu calle.';
    if (!campos.dirNumero.trim()) next.dirNumero = 'Ingresa el número.';
    setErrores(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorEnvio(null);
    if (!formatoSel) {
      setErrorEnvio('Selecciona un formato para continuar.');
      return;
    }
    if (!validar()) return;

    setEnviando(true);
    try {
      const res = await fetch('/api/flow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfilId: fragancia.perfilId,
          productoId: formatoSel.id,
          packagingIds,
          clienteNombre: campos.clienteNombre.trim(),
          clienteRut: campos.clienteRut.trim(),
          clienteEmail: campos.clienteEmail.trim(),
          clienteTelefono: campos.clienteTelefono.trim(),
          dirRegion: campos.dirRegion,
          dirComuna: campos.dirComuna.trim(),
          dirCalle: campos.dirCalle.trim(),
          dirNumero: campos.dirNumero.trim(),
          dirDepto: campos.dirDepto.trim() || undefined,
          dirReferencias: campos.dirReferencias.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { redirectUrl?: string; error?: string }
        | null;

      if (!res.ok || !data?.redirectUrl) {
        setErrorEnvio(data?.error ?? 'No se pudo iniciar el pago. Intenta de nuevo.');
        setEnviando(false);
        return;
      }

      // Redirección a FLOW. Mantenemos `enviando` para no permitir doble submit.
      window.location.href = data.redirectUrl;
    } catch {
      setErrorEnvio('Hubo un problema de conexión. Intenta de nuevo.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
      {/* ── Columna principal: diseño + selección + datos ── */}
      <div className="space-y-8">
        {/* Fragancia diseñada */}
        <section className="glass rounded-2xl p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Tu fragancia</p>
          <div className="mt-3">
            <FraganciaCard
              nombre={fragancia.nombreFragancia}
              familia={fragancia.familia}
              intensidadLabel={conc.label}
              notasTop={fragancia.notasCabeza}
              className="border-none bg-transparent p-0"
            />
          </div>
          <div className="mt-5">
            <PiramideNotas
              familia={fragancia.familia}
              notas={{
                cabeza: fragancia.notasCabeza,
                corazon: fragancia.notasCorazon,
                fondo: fragancia.notasFondo,
              }}
              intensidad={conc.intensidad}
              estela={conc.estela}
            />
          </div>
        </section>

        {/* Formato */}
        <section>
          <h3 className="text-xl text-ink">Elige tu formato</h3>
          <p className="mt-1 text-sm text-ink-muted">
            La concentración define la presencia y la duración.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {formatos.map((f) => {
              const activo = f.id === formatoId;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormatoId(f.id)}
                  aria-pressed={activo}
                  className={[
                    'group relative rounded-xl border p-4 text-left transition-all duration-300 ease-sensory',
                    activo
                      ? 'border-brass bg-brass/10'
                      : 'border-ink/10 bg-canvas-soft hover:border-brass/40',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{f.nombre}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{f.ml} ml</p>
                    </div>
                    <span
                      className={[
                        'mt-0.5 h-4 w-4 shrink-0 rounded-full border transition-colors',
                        activo ? 'border-brass bg-brass' : 'border-ink/30',
                      ].join(' ')}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-3 text-base text-brass">{formatCLP(f.precio)}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Packaging */}
        {packaging.length > 0 && (
          <section>
            <h3 className="text-xl text-ink">Detalles que lo hacen ritual</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Opcional. Suma a la experiencia de abrirlo.
            </p>
            <div className="mt-4 space-y-3">
              {packaging.map((p) => {
                const activo = packagingIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={[
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-300 ease-sensory',
                      activo
                        ? 'border-brass/60 bg-brass/5'
                        : 'border-ink/10 bg-canvas-soft hover:border-brass/30',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={() => togglePackaging(p.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-brass"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-ink">{p.nombre}</span>
                        <span className="shrink-0 text-sm text-brass">
                          {p.precioExtra > 0 ? `+ ${formatCLP(p.precioExtra)}` : 'Incluido'}
                        </span>
                      </div>
                      {p.descripcion && (
                        <p className="mt-0.5 text-xs text-ink-muted">{p.descripcion}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* Datos del cliente */}
        <section>
          <h3 className="text-xl text-ink">Tus datos</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Para emitir el pedido y enviártelo a casa.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="clienteNombre">Nombre completo</Label>
              <Input
                id="clienteNombre"
                value={campos.clienteNombre}
                onChange={(e) => set('clienteNombre', e.target.value)}
                error={errores.clienteNombre}
                placeholder="Tu nombre y apellido"
                autoComplete="name"
              />
            </div>

            <div>
              <Label htmlFor="clienteRut">RUT</Label>
              <Input
                id="clienteRut"
                value={campos.clienteRut}
                onChange={(e) => set('clienteRut', e.target.value)}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && validarRut(v)) set('clienteRut', formatRut(v));
                }}
                error={errores.clienteRut}
                placeholder="12.345.678-9"
                inputMode="text"
              />
            </div>

            <div>
              <Label htmlFor="clienteTelefono">Teléfono</Label>
              <Input
                id="clienteTelefono"
                value={campos.clienteTelefono}
                onChange={(e) => set('clienteTelefono', e.target.value)}
                error={errores.clienteTelefono}
                placeholder="+56 9 1234 5678"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="clienteEmail">Correo electrónico</Label>
              <Input
                id="clienteEmail"
                type="email"
                value={campos.clienteEmail}
                onChange={(e) => set('clienteEmail', e.target.value)}
                error={errores.clienteEmail}
                placeholder="tu@correo.cl"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="dirRegion">Región</Label>
              <Select
                id="dirRegion"
                value={campos.dirRegion}
                onChange={(e) => set('dirRegion', e.target.value)}
                error={errores.dirRegion}
              >
                <option value="" disabled>
                  Selecciona una región
                </option>
                {REGIONES_CHILE.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="dirComuna">Comuna</Label>
              <Input
                id="dirComuna"
                value={campos.dirComuna}
                onChange={(e) => set('dirComuna', e.target.value)}
                error={errores.dirComuna}
                placeholder="Tu comuna"
                autoComplete="address-level2"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="dirCalle">Calle</Label>
              <Input
                id="dirCalle"
                value={campos.dirCalle}
                onChange={(e) => set('dirCalle', e.target.value)}
                error={errores.dirCalle}
                placeholder="Nombre de la calle / avenida"
                autoComplete="address-line1"
              />
            </div>

            <div>
              <Label htmlFor="dirNumero">Número</Label>
              <Input
                id="dirNumero"
                value={campos.dirNumero}
                onChange={(e) => set('dirNumero', e.target.value)}
                error={errores.dirNumero}
                placeholder="1234"
              />
            </div>

            <div>
              <Label htmlFor="dirDepto" hint="opcional">
                Depto / casa
              </Label>
              <Input
                id="dirDepto"
                value={campos.dirDepto}
                onChange={(e) => set('dirDepto', e.target.value)}
                placeholder="Depto 502, Torre B…"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="dirReferencias" hint="opcional">
                Referencias
              </Label>
              <Textarea
                id="dirReferencias"
                value={campos.dirReferencias}
                onChange={(e) => set('dirReferencias', e.target.value)}
                placeholder="Indicaciones para la entrega, horarios, conserjería…"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Resumen pegajoso ── */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg text-ink">Resumen</h3>

          <div className="mt-4 space-y-3 text-sm">
            <Linea
              etiqueta={fragancia.nombreFragancia}
              detalle={formatoSel?.nombre ?? 'Sin formato'}
              valor={montoProducto}
            />

            <AnimatePresence initial={false}>
              {packagingSel.map((p) => (
                <motion.div key={p.id} {...fade} layout>
                  <Linea etiqueta={p.nombre} detalle="Packaging" valor={p.precioExtra} />
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex items-center justify-between text-ink-muted">
              <span>Envío</span>
              <span>Por confirmar</span>
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-5">
            <span className="text-sm text-ink-soft">Total</span>
            <motion.span
              key={montoTotal}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="text-2xl text-brass"
            >
              {formatCLP(montoTotal)}
            </motion.span>
          </div>

          {errorEnvio && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300"
            >
              {errorEnvio}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={enviando}
            className="mt-5 w-full"
          >
            {enviando ? 'Redirigiendo al pago…' : 'Pagar con FLOW'}
          </Button>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-muted">
            Pago seguro vía FLOW. Tu fragancia se prepara a mano una vez confirmado.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Linea({
  etiqueta,
  detalle,
  valor,
}: {
  etiqueta: string;
  detalle: string;
  valor: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-ink">{etiqueta}</p>
        <p className="truncate text-xs text-ink-muted">{detalle}</p>
      </div>
      <span className="shrink-0 text-ink-soft">
        {valor > 0 ? formatCLP(valor) : 'Incluido'}
      </span>
    </div>
  );
}
