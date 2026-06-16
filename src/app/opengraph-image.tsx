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
            'radial-gradient(ellipse at 50% 35%, #28221a 0%, #15120d 70%)',
          color: '#ece4d6',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 14,
            textTransform: 'uppercase',
            color: '#c0875c',
          }}
        >
          Perfume Lab Chile
        </div>
        <div style={{ display: 'flex', fontSize: 74, marginTop: 28, textAlign: 'center' }}>
          No busques un perfume.
        </div>
        <div style={{ display: 'flex', fontSize: 74, color: '#d6a87d' }}>Encuentra el tuyo.</div>
        <div style={{ fontSize: 29, marginTop: 30, color: '#c2b6a4' }}>
          Un ritual que traduce quién eres en una fragancia
        </div>
      </div>
    ),
    { ...size }
  );
}
