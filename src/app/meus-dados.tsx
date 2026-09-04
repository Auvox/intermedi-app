import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Alert, Image, Pressable, } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { EditableProfileField } from '@/components/profile/editable-profile-field';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { API_URL, getApiAssetUrl } from '@/constants/api';
import { useUser } from '@/context/user-context';

type ProfileForm = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  remedioFrequente: string;
  senha: string;
};

const emptyProfile: ProfileForm = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  remedioFrequente: '',
  senha: '',
};

export default function MeusDadosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, setUser } = useUser();
  const form = emptyProfile;

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [photoToUpload, setPhotoToUpload] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const displayedProfileImage = profileImage ?? getApiAssetUrl(user?.fotoPerfilPaciente);

  function selecionarFoto(asset: ImagePicker.ImagePickerAsset) {
    setProfileImage(asset.uri);
    setPhotoToUpload(asset);
  }

async function escolherDaGaleria() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    selecionarFoto(result.assets[0]);
  }
}

async function tirarFoto() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      'Permissão necessária',
      'Permita o acesso à câmera para tirar uma foto.',
    );
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    cameraType: ImagePicker.CameraType.front,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    selecionarFoto(result.assets[0]);
  }
}

function escolherFoto() {
  Alert.alert('Foto de perfil', 'Escolha uma opção', [
    {
      text: 'Tirar foto',
      onPress: tirarFoto,
    },
    {
      text: 'Escolher da galeria',
      onPress: escolherDaGaleria,
    },
    {
      text: 'Cancelar',
      style: 'cancel',
    },
  ]);
}

async function salvarFoto() {
  if (!user?.id) {
    Alert.alert('Erro', 'Faça login novamente para salvar a foto.');
    return;
  }

  if (!photoToUpload) {
    Alert.alert('Foto de perfil', 'Escolha ou tire uma foto antes de salvar.');
    return;
  }

  try {
    setSavingPhoto(true);
    const formData = new FormData();
    const fileName = photoToUpload.fileName || `perfil-${user.id}.jpg`;

    formData.append('foto', {
      uri: photoToUpload.uri,
      name: fileName,
      type: photoToUpload.mimeType || 'image/jpeg',
    } as unknown as Blob);

    const response = await fetch(`${API_URL}/api/pacientes/${user.id}/foto`, {
      method: 'PUT',
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Não foi possível salvar a foto.');
    }

    await setUser({
      ...user,
      fotoPerfilPaciente: data.fotoPerfilPaciente,
    });
    setPhotoToUpload(null);
    setProfileImage(getApiAssetUrl(data.fotoPerfilPaciente));
    Alert.alert('Pronto', 'Foto de perfil atualizada.');
  } catch (error) {
    console.error('Erro ao salvar foto:', error);
    Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível salvar a foto.');
  } finally {
    setSavingPhoto(false);
  }
}

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: insets.top + Spacing.md },
        ]}>
        <BackButton />
        <AppText variant="h3" color={Colors.textOnPrimary} style={styles.headerTitle}>
          Meus dados
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}>
        <View style={styles.identity}>
          <Pressable
            onPress={escolherFoto}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
            style={[
              styles.avatar,
              { backgroundColor: colors.primarySoft, borderColor: colors.surface },
            ]}>
            {displayedProfileImage ? (
              <Image source={{ uri: displayedProfileImage }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person" size={44} color={colors.primary} />
            )}

            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={17} color={Colors.textOnPrimary} />
            </View>
          </Pressable>
          <AppText variant="h2" style={styles.name}>
            {form.nome || 'Seu nome'}
          </AppText>
          <AppText variant="label">Visualize e altere seus dados pessoais</AppText>
        </View>

        <ProfileSection title="Dados cadastrais">
          <EditableProfileField
            icon="person-outline"
            label="Nome completo"
            value={form.nome}
            autoCapitalize="words"
          />
          <EditableProfileField
            icon="document-text-outline"
            label="CPF"
            value={form.cpf}
            keyboardType="numeric"
            maxLength={14}
          />
          <EditableProfileField
            icon="mail-outline"
            label="E-mail"
            value={form.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <EditableProfileField
            icon="call-outline"
            label="Telefone"
            value={form.telefone}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </ProfileSection>

        <ProfileSection title="Informações adicionais">
          <EditableProfileField
            icon="medkit-outline"
            label="Medicamento frequente"
            value={form.remedioFrequente}
            autoCapitalize="words"
          />
          <EditableProfileField
            icon="lock-closed-outline"
            label="Senha"
            value={form.senha}
            placeholder="••••••••"
            secureTextEntry
          />
        </ProfileSection>

        <View style={styles.actions}>
          <Button title="Salvar alterações" onPress={salvarFoto} loading={savingPhoto} />
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ProfileSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <AppText variant="h3">{title}</AppText>
      <View style={styles.fields}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.xxl,
  },
  identity: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: Radius.pill,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.lg,
  },
  fields: {
    gap: Spacing.md,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.pill,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
