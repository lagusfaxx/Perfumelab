import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Perfume Lab Chile — Diseña tu fragancia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(ellipse at 50% 35%, #3c2160 0%, #0c0a0d 65%)',
          color: '#f4eee9',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 14,
            textTransform: 'uppercase',
            color: '#c9a44c',
          }}
        >
          Perfume Lab Chile
        </div>
        <div style={{ display: 'flex', fontSize: 76, marginTop: 28, textAlign: 'center' }}>
          No elijas un perfume.
        </div>
        <div style={{ display: 'flex', fontSize: 76, color: '#e3c878' }}>Diséñalo.</div>
        <div style={{ fontSize: 30, marginTop: 30, color: '#cabfc0' }}>
          Un ritual que traduce quién eres en una fragancia única
        </div>
      </div>
    ),
    { ...size }
  );
}
