import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { MASCOTS } from '@/components/ui/mascot';
import { FontFamily, Radius } from '@/constants/theme';
import { useCare } from '@/context/care-context';
import { useUser } from '@/context/user-context';
import { useTheme } from '@/context/theme-context';

type IconName = keyof typeof Ionicons.glyphMap;
const TAB_ICONS: Record<string, { outline: IconName; filled: IconName }> = {
  farmacias: { outline: 'add-circle-outline', filled: 'add-circle' },
  'buscar-medicamentos': { outline: 'bandage-outline', filled: 'bandage' },
  index: { outline: 'home-outline', filled: 'home' },
  broto: { outline: 'chatbubble-ellipses-outline', filled: 'chatbubble-ellipses' },
  favoritos: { outline: 'heart-outline', filled: 'heart' },
  perfil: { outline: 'person-outline', filled: 'person' },
};

// Barra flutuante do design: só a aba ativa mostra o nome dentro da pílula verde.
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, textScale } = useTheme();
  return <View style={[styles.barWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
    <View style={[styles.bar, { backgroundColor: colors.surface }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = descriptors[route.key].options.title ?? route.name;
        const icon = TAB_ICONS[route.name] ?? TAB_ICONS.index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: focused }} onPress={onPress}
          style={[styles.item, focused && [styles.itemFocused, { backgroundColor: colors.primary }]]}>
          <Ionicons name={focused ? icon.filled : icon.outline} size={22} color={focused ? '#FFFFFF' : colors.textSecondary} />
          {focused && textScale === 1 && <AppText variant="label" color="#FFFFFF" style={styles.label} numberOfLines={1}>{label}</AppText>}
        </Pressable>;
      })}
    </View>
  </View>;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { user, loading } = useUser();
  const care = useCare();
  if (loading) return <LoadingScreen />;
  if (!user?.token) return <Redirect href="/login" />;

  return (
    <Tabs tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}>
      <Tabs.Screen name="farmacias" options={{ title: 'Farmácias' }} />
      <Tabs.Screen name="buscar-medicamentos" options={{ title: 'Remédios' }} />
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="broto" options={{ title: MASCOTS[care.mascot].name }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingTop: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 30, padding: 7, boxShadow: '0 6px 24px rgba(13,35,28,0.12)', width: '100%', maxWidth: 520, alignSelf: 'center' },
  item: { minWidth: 44, height: 50, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 8 },
  itemFocused: { paddingHorizontal: 16 },
  label: { fontFamily: FontFamily.semibold },
});
