'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';

/**
 * Campo de partículas en canvas que encarna la familia activa:
 * color, velocidad, densidad y desenfoque cambian con la sinestesia.
 * Respeta prefers-reduced-motion (render estático y disperso).
 */
export function ParticleField({
  familia,
  className,
  intensity = 1,
}: {
  familia: FamiliaKey;
  className?: string;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  // Refs para que el loop lea siempre el valor más reciente sin re-montar.
  const familiaRef = useRef(familia);
  const intensityRef = useRef(intensity);
  familiaRef.current = familia;
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; life: number };
    let particles: P[] = [];

    const cfg = () => FAMILIAS[familiaRef.current].motion;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round((reduced ? 18 : cfg().particulas) * intensityRef.current);
      particles = Array.from({ length: target }, () => spawn());
    };

    const spawn = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 0.6 + Math.random() * 2.4,
      a: 0.05 + Math.random() * 0.35,
      life: Math.random(),
    });

    const draw = () => {
      const f = FAMILIAS[familiaRef.current];
      const m = f.motion;
      ctx.clearRect(0, 0, w, h);
      const speed = reduced ? 0 : m.velocidad * intensityRef.current;
      for (const p of particles) {
        p.x += p.vx * speed;
        p.y += p.vy * speed - 0.05 * speed; // leve ascenso, como humo
        p.life += 0.003 * speed;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        const twinkle = 0.5 + 0.5 * Math.sin(p.life * Math.PI * 2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = f.colorSoft;
        ctx.globalAlpha = p.a * (reduced ? 0.6 : twinkle);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
