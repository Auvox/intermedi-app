import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './app-text';
import { BackButton } from './back-button';

export function SectionHeader({ title }: { title: string }) {
  const router = useRouter();
  return <SafeAreaView edges={['top']} style={{ backgroundColor: '#146B58' }}>
    <View style={styles.row}><BackButton tone="light" onPress={() => router.canGoBack() ? router.back() : router.replace('/perfil')} />
      <AppText variant="h3" color="#FFFFFF" style={styles.title}>{title}</AppText><View style={styles.spacer} /></View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 56 }, title: { flex: 1, textAlign: 'center' }, spacer: { width: 40 } });
