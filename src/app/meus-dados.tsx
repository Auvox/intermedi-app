import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Alert, Image, Pressable, } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { EditableProfileField } from '@/components/profile/editable-profile-field';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { API_URL, ApiError, apiRequest, getApiAssetUrl } from '@/constants/api';
import { type LoggedUser, useUser } from '@/context/user-context';

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
  const { user, setUser, loading: sessionLoading } = useUser();
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [retry, setRetry] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const token = user?.token;
  useEffect(() => {
    if (sessionLoading) return;
    if (!token) { router.replace('/login'); return; }
    let active = true;
    apiRequest<{ user: Omit<LoggedUser, 'token'> }>('/api/pacientes/me', {}, token)
      .then(async ({ user: fresh }) => {
        if (!active) return;
        setForm({ nome: fresh.nome, cpf: fresh.cpf || '', email: fresh.email,
          telefone: fresh.telefone || '', remedioFrequente: fresh.remedioFrequente || '', senha: '' });
        await setUser({ ...fresh, token });
      })
      .catch(async (error) => {
        if (!active) return;
        setProfileError(error.message);
        if (error instanceof ApiError && error.status === 401) {
          await setUser(null); router.replace('/login');
        }
      })
      .finally(() => { if (active) setLoadingProfile(false); });
    return () => { active = false; };
  }, [token, router, setUser, retry, sessionLoading]);
  function change(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

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

async function salvarDados() {
  if (!user?.token || savingPhoto || deleting || loadingProfile || profileError) return;
  setSavingPhoto(true);
  let saved = false;
  try {
    const { user: updated } = await apiRequest<{ user: Omit<LoggedUser, 'token'> }>('/api/pacientes/me', {
      method: 'PUT', body: JSON.stringify({ nomePaciente: form.nome, cpfPaciente: form.cpf,
        emailPaciente: form.email.trim(), telPaciente: form.telefone,
        medicamentoFrequentePaciente: form.remedioFrequente,
        ...(form.senha ? { senhaPaciente: form.senha } : {}) }),
    }, user.token);
    saved = true;
    let nextUser = { ...updated, token: user.token };
    await setUser(nextUser);
    setForm((current) => ({ ...current, senha: '' }));
    if (photoToUpload) {
      const formData = new FormData();
      const name = photoToUpload.fileName || 'perfil.jpg';
      if (Platform.OS === 'web') {
        const blob = await (await globalThis.fetch(photoToUpload.uri)).blob();
        formData.append('foto', blob, name);
      } else {
        // React Native recebe arquivo por URI no FormData.
        formData.append('foto', { uri: photoToUpload.uri, name,
          type: photoToUpload.mimeType || 'image/jpeg' } as unknown as Blob);
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(`${API_URL}/api/pacientes/${user.id}/foto`, {
          method: 'PUT', headers: { Authorization: `Bearer ${user.token}` },
          body: formData, signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new ApiError(data.message || 'Não foi possível salvar a foto.', response.status);
        nextUser = { ...nextUser, fotoPerfilPaciente: data.fotoPerfilPaciente };
        await setUser(nextUser);
        setPhotoToUpload(null);
        setProfileImage(getApiAssetUrl(data.fotoPerfilPaciente));
      } finally { clearTimeout(timeout); }
    }
    showMessage('Pronto', 'Dados atualizados.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível salvar.';
    showMessage('Erro', saved ? `Os dados foram salvos, mas a foto não foi atualizada. ${message}` : message);
    if (error instanceof ApiError && error.status === 401) { await setUser(null); router.replace('/login'); }
  } finally { setSavingPhoto(false); }
}

async function excluirConta() {
  if (!user?.token || deleting || savingPhoto) return;
  setDeleting(true);
  try {
    await apiRequest('/api/pacientes/me', { method: 'DELETE' }, user.token);
    await setUser(null);
    router.replace('/welcome');
  } catch (error) {
    showMessage('Erro', error instanceof Error ? error.message : 'Não foi possível excluir a conta.');
  } finally { setDeleting(false); }
}

function confirmarExclusao() {
  const message = 'Sua conta será excluída do Intermedi, inclusive do cadastro compartilhado com o site. Deseja continuar?';
  if (Platform.OS === 'web') {
    if (window.confirm(message)) void excluirConta();
  } else {
    Alert.alert('Excluir minha conta', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir conta', style: 'destructive', onPress: () => void excluirConta() },
    ]);
  }
}

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert(title, message);
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
            onPress={Platform.OS === 'web' ? escolherDaGaleria : escolherFoto} disabled={savingPhoto || deleting}
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

        {loadingProfile ? <AppText>Carregando seus dados...</AppText> : null}
        {profileError ? <View><AppText>{profileError}</AppText><Button title="Tentar novamente" onPress={() => { setLoadingProfile(true); setProfileError(''); setRetry((n) => n + 1); }} /></View> : null}
        <ProfileSection title="Dados cadastrais">
          <EditableProfileField
            icon="person-outline"
            label="Nome completo"
            value={form.nome}
            onChangeText={(value) => change('nome', value)}
            editable={!loadingProfile && !savingPhoto && !deleting && !profileError}
            autoCapitalize="words"
          />
          <EditableProfileField
            icon="document-text-outline"
            label="CPF"
            value={form.cpf}
            onChangeText={(value) => change('cpf', value)}
            editable={!loadingProfile && !savingPhoto && !deleting && !profileError}
            keyboardType="numeric"
            maxLength={14}
          />
          <EditableProfileField
            icon="mail-outline"
            label="E-mail"
            value={form.email}
            onChangeText={(value) => change('email', value)}
            editable={!loadingProfile && !savingPhoto && !deleting && !profileError}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <EditableProfileField
            icon="call-outline"
            label="Telefone"
            value={form.telefone}
            onChangeText={(value) => change('telefone', value)}
            editable={!loadingProfile && !savingPhoto && !deleting && !profileError}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </ProfileSection>

        <ProfileSection title="Informações adicionais">
          <EditableProfileField
            icon="medkit-outline"
            label="Medicamento frequente"
            value={form.remedioFrequente}
            onChangeText={(value) => change('remedioFrequente', value)}
            editable={!loadingProfile && !savingPhoto && !deleting && !profileError}
            autoCapitalize="words"
          />
          <EditableProfileField
            icon="lock-closed-outline"
            label="Senha"
            value={form.senha}
            onChangeText={(value) => change('senha', value)}
            editable={!loadingProfile && !savingPhoto && !deleting && !profileError}
            placeholder="Deixe vazio para manter a senha"
            secureTextEntry
          />
        </ProfileSection>

        <View style={styles.actions}>
          <Button title="Salvar alterações" onPress={salvarDados} loading={savingPhoto} disabled={loadingProfile || deleting || !!profileError} />
          <Button title="Excluir minha conta" variant="ghost" onPress={confirmarExclusao} loading={deleting} disabled={savingPhoto || loadingProfile || !!profileError} />
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
    ...Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)' },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
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
