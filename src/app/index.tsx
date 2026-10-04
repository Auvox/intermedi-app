import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/user-context';
import { LoadingScreen, LOADING_CYCLE_MS } from '@/components/ui/loading-screen';
export default function SplashRedirectScreen() {
  const router = useRouter();
  const { user, loading } = useUser();
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => router.replace(user?.token ? '/(tabs)' : '/welcome'), LOADING_CYCLE_MS);
    return () => clearTimeout(timer);
  }, [loading, user?.token, router]);
  return <LoadingScreen />;
}
