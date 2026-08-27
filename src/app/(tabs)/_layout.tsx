import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';

type TabIconProps = {
  focused: boolean;
  outlineName: keyof typeof Ionicons.glyphMap;
  filledName: keyof typeof Ionicons.glyphMap;
};

function TabIcon({ focused, outlineName, filledName }: TabIconProps) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
      <Ionicons
        name={focused ? filledName : outlineName}
        size={20}
        color={focused ? Colors.primary : Colors.textOnPrimary}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.textOnPrimary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.75)',
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingTop: Spacing.sm,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="farmacias"
        options={{
          title: 'Farmácias',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} outlineName="medical-outline" filledName="medical" />
          ),
        }}
      />
      <Tabs.Screen
        name="buscar-medicamentos"
        options={{
          title: 'Remédios',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              outlineName="medkit-outline"
              filledName="medkit"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} outlineName="home-outline" filledName="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} outlineName="heart-outline" filledName="heart" />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} outlineName="person-outline" filledName="person" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperFocused: {
    backgroundColor: Colors.textOnPrimary,
  },
});
