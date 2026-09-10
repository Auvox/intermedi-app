import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { Easing, Image, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { getApiAssetUrl } from '@/constants/api';
import { useUser } from '@/context/user-context';

type TabIconProps = {
  focused: boolean;
  outlineName: keyof typeof MaterialCommunityIcons.glyphMap;
  filledName: keyof typeof MaterialCommunityIcons.glyphMap;
};

function TabIcon({ focused, outlineName, filledName }: TabIconProps) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
      <MaterialCommunityIcons
        name={focused ? filledName : outlineName}
        size={25}
        color={focused ? Colors.primary : Colors.textOnPrimary}
      />
    </View>
  );
}

function ProfileTabIcon({ focused }: { focused: boolean }) {
  const { user } = useUser();
  const profileImage = getApiAssetUrl(user?.fotoPerfilPaciente);

  if (!profileImage) {
    return <TabIcon focused={focused} outlineName="account-outline" filledName="account" />;
  }

  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
      <Image
        source={{ uri: profileImage }}
        style={[
          styles.profileTabImage,
          { borderColor: focused ? Colors.primary : Colors.textOnPrimary },
        ]}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const bottomPadding = Math.max(insets.bottom, Spacing.md);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'fade',
        transitionSpec: {
          animation: 'timing',
          config: { duration: 220, easing: Easing.inOut(Easing.cubic) },
        },
        tabBarActiveTintColor: Colors.textOnPrimary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.75)',
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: { width: 34, height: 34 },
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopWidth: 0,
          height: 64 + bottomPadding,
          flexShrink: 0,
          paddingTop: Spacing.sm,
          paddingBottom: bottomPadding,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 16,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="farmacias"
        options={{
          title: 'Farmácias',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} outlineName="store-plus-outline" filledName="store-plus" />
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
              outlineName="pill"
              filledName="pill"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} outlineName="home-variant-outline" filledName="home-variant" />
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
          tabBarIcon: ({ focused }) => <ProfileTabIcon focused={focused} />,
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
  profileTabImage: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
});
