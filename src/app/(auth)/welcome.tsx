import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';

const green = '#00AD69';
const ink = '#123E39';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.hero}>
          <View style={styles.orbTop} />
          <View style={styles.orbSide} />
          <Wordmark height={76} variant="light" />

          <View style={styles.heroCopy}>
            <AppText color="#FFFFFF" style={styles.headline}>
              Encontre medicamentos <AppText color="#4EE6A6" style={styles.headline}>perto de você</AppText>
            </AppText>
            <AppText color="#D8F0E7" style={styles.description}>
              Consulte a disponibilidade nas farmácias do SUS e encontre o que você precisa de forma rápida e fácil.
            </AppText>
          </View>

          <View style={styles.illustration} accessibilityLabel="Ilustração de farmácia e medicamentos">
            <View style={styles.pharmacy}>
              <View style={styles.pharmacyRoof} />
              <View style={styles.pharmacyBody}>
                <Ionicons name="medkit" size={34} color={green} />
                <AppText style={styles.pharmacyName}>FARMÁCIA SUS</AppText>
              </View>
            </View>
            <View style={styles.medicineCard}>
              <Ionicons name="medical" size={24} color={green} />
              <View>
                <AppText style={styles.medicineTitle}>Medicamento</AppText>
                <AppText style={styles.medicineStatus}>Disponível perto de você</AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <View style={styles.pills}>
            <View style={styles.activePill} />
            <View style={styles.pill} />
            <View style={styles.pill} />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/login')} accessibilityRole="button">
            <AppText color="#FFFFFF" style={styles.buttonText}>Começar</AppText>
            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.secondaryLink} onPress={() => router.push('/register/cadastro')} accessibilityRole="button">
            <AppText color={ink} style={styles.secondaryText}>Ainda não tem conta? <AppText color={green} style={styles.secondaryTextBold}>Criar conta</AppText></AppText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5FFF9'
  },
  content: {
    flexGrow: 1
  },
  hero: {
    flex: 1, minHeight: 530,
    backgroundColor: '#064B3A',
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    paddingHorizontal: 28,
    paddingTop: 28,
    overflow: 'hidden'
  },
  orbTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#0C634A',
    top: -155, right: -90
  },
  orbSide: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#075D44',
    top: 180,
    left: -145
  },
  heroCopy: {
    marginTop: 50,
    maxWidth: 330
  },
  headline: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800'
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 15
  },
  illustration: {
    flex: 1,
    minHeight: 225,
    justifyContent: 'flex-end',
    paddingBottom: 30
  },
  pharmacy: {
    alignSelf: 'center',
    width: '87%',
    transform: [{ rotate: '-3deg' }]
  },
  pharmacyRoof: {
    height: 28,
    backgroundColor: '#E5FFF1',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 6,
    borderBottomColor: green
  },
  pharmacyBody: {
    height: 122,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 22,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    gap: 5
  },
  pharmacyName: {
    fontWeight: '800',
    fontSize: 12,
    color: ink,
    letterSpacing: 0.6
  },
  medicineCard: {
    position: 'absolute',
    bottom: 38,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#002E23',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5
  },
  medicineTitle: {
    color: ink,
    fontWeight: '800',
    fontSize: 12
  },
  medicineStatus: {
    color: green,
    fontSize: 10,
    marginTop: 2
  },
  bottom: {
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 18
  },
  pills: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 7,
    alignItems: 'center'
  },
  activePill: {
    width: 19,
    height: 7,
    borderRadius: 7,
    backgroundColor: green
  },
  pill: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: '#C4ECDD'
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: green,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800'
  },
  secondaryLink: {
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryText: {
    fontSize: 13
  },
  secondaryTextBold: {
    fontWeight: '800'
  },
});
