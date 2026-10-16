import { useRouter } from 'expo-router';
import { ScreenHeader } from './screen-header';

// Cabeçalho verde com botão voltar usado nas telas secundárias.
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return <ScreenHeader back title={title} subtitle={subtitle} onBack={() => router.canGoBack() ? router.back() : router.replace('/perfil')} />;
}
