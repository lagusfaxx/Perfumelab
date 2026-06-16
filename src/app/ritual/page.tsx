import type { Metadata } from 'next';
import { RitualExperience } from '@/components/ritual/RitualExperience';

export const metadata: Metadata = {
  title: 'El Ritual',
  description:
    'Siete preguntas. Un viaje de autoconocimiento que revela tu fragancia única.',
};

export default function RitualPage() {
  return <RitualExperience />;
}
