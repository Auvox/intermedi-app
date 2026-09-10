import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Alert, Image, Pressable, } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';

import { useRef, useState } from 'react';
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
  const [draft, setForm] = useState<ProfileForm | null>(null);
  const form = draft ?? (user ? { nome: user.nome, email: user.email, cpf: user.cpf ?? '',
    telefone: user.telefone ?? '', remedioFrequente: user.remedioFrequente ?? '', senha: '' } : emptyProfile);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [busy, setBusy] = useState<'save' | 'delete' | 'load' | null>(null);
  const operation = useRef(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');
  const profileLoaded = user?.cpf !== undefined;
  const [accountDeleted, setAccountDeleted] = useState(false);

  function changeField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...(current ?? form), [field]: value }));
    setMessage('');
  }

  async function finishLogout() {
    await setUser(null);
    router.dismissAll();
    router.replace('/(auth)/login');
  }

  async function requestProfile(method: string, suffix = '', body: object = {}) {
    const response = await fetch(`${API_URL}/api/pacientes/${user!.id}${suffix}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, senhaAtual }),
    });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || 'Não foi possível concluir a operação. Tente novamente.');
    if (!data?.user) throw new Error('Resposta inválida do servidor. Tente novamente.');
    return data;
  }

  async function runOperation(kind: 'save' | 'delete' | 'load') {
    if (operation.current) return;
    if (!user?.id || !senhaAtual) {
      setMessage(!user?.id ? 'Faça login novamente.' : 'Informe a senha atual para continuar.');
      return;
    }
    operation.current = true;
    setBusy(kind);
    setMessage('');
    let profileSaved = false;
    try {
      if (kind === 'delete') {
        await requestProfile('DELETE');
        setAccountDeleted(true);
        setConfirmDelete(false);
        try {
          await finishLogout();
        } catch {
          setMessage('Conta excluída. Não foi possível limpar a sessão local. Toque abaixo para tentar novamente.');
          return;
        }
      } else if (kind === 'load') {
        const data = await requestProfile('POST', '/perfil');
        await setUser(data.user);
        setForm(null);
      } else {
        const data = await requestProfile('PUT', '', form);
        profileSaved = true;
        setSenhaAtual(form.senha || senhaAtual);
        await setUser(data.user);
        setForm(null);
        if (photoToUpload) await salvarFoto(data.user);
        setSenhaAtual('');
        setMessage('Dados atualizados com sucesso.');
      }
    } catch (error) {
      setMessage(`${profileSaved ? 'Os dados foram salvos, mas houve uma falha ao atualizar a sessão ou a foto. ' : ''}${error instanceof Error ? error.message : 'Verifique sua conexão e tente novamente.'}`);
    } finally {
      operation.current = false;
      setBusy(null);
    }
  }

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [photoToUpload, setPhotoToUpload] = useState<ImagePicker.ImagePickerAsset | null>(null);
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

async function salvarFoto(updatedUser: NonNullable<typeof user>) {
  if (!photoToUpload) return;
  const formData = new FormData();
  const fileName = photoToUpload.fileName || `perfil-${updatedUser.id}.jpg`;
  const file = new File(photoToUpload.uri);
  formData.append('foto', file, fileName);
  const response = await fetch(`${API_URL}/api/pacientes/${updatedUser.id}/foto`, {
    method: 'PUT', body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Não foi possível salvar a foto.');
  await setUser({ ...updatedUser, fotoPerfilPaciente: data.fotoPerfilPaciente });
  setPhotoToUpload(null);
  setProfileImage(getApiAssetUrl(data.fotoPerfilPaciente));
}

  if (accountDeleted) {
    return (
      <View style={[styles.flex, styles.scrollContent, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.xl }]}>
        <AppText variant="h2">Conta excluída</AppText>
        {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
        <Button title="Ir para o login" loading={!!busy} onPress={async () => {
          setBusy('delete');
          try { await finishLogout(); }
          catch { setMessage('Não foi possível limpar a sessão local. Tente novamente.'); }
          finally { setBusy(null); }
        }} />
      </View>
    );
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
        <BackButton onPress={() => { if (!operation.current) router.back(); }} />
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
            disabled={!!busy || confirmDelete}
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
          <AppText variant="label" style={styles.name}>Toque no lápis para editar cada campo.</AppText>
          <AppText variant="caption" style={styles.name}>Ao terminar, toque em Salvar alterações.</AppText>
        </View>

        <ProfileSection title="Dados cadastrais">
          <EditableProfileField
            icon="person-outline"
            label="Nome completo"
            value={form.nome}
            onChangeText={(value) => changeField('nome', value)}
            editable={!busy && !confirmDelete && profileLoaded}
            autoCapitalize="words"
          />
          <EditableProfileField
            icon="document-text-outline"
            label="CPF"
            value={form.cpf}
            onChangeText={(value) => changeField('cpf', value)}
            editable={!busy && !confirmDelete && profileLoaded}
            keyboardType="numeric"
            maxLength={14}
          />
          <EditableProfileField
            icon="mail-outline"
            label="E-mail"
            value={form.email}
            onChangeText={(value) => changeField('email', value)}
            editable={!busy && !confirmDelete && profileLoaded}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <EditableProfileField
            icon="call-outline"
            label="Telefone"
            value={form.telefone}
            onChangeText={(value) => changeField('telefone', value)}
            editable={!busy && !confirmDelete && profileLoaded}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </ProfileSection>

        <ProfileSection title="Informações adicionais">
          <EditableProfileField
            icon="medkit-outline"
            label="Medicamento frequente"
            value={form.remedioFrequente}
            onChangeText={(value) => changeField('remedioFrequente', value)}
            editable={!busy && !confirmDelete && profileLoaded}
            autoCapitalize="words"
          />
          <EditableProfileField
            icon="lock-closed-outline"
            label="Nova senha (opcional)"
            value={form.senha}
            onChangeText={(value) => changeField('senha', value)}
            editable={!busy && !confirmDelete && profileLoaded}
            placeholder="Deixe em branco para manter"
            secureTextEntry
          />
        </ProfileSection>

        <EditableProfileField
          icon="lock-closed-outline"
          label="Senha atual"
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          editable={!busy}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Confirme sua senha para continuar"
        />
        {!profileLoaded && (
          <View style={styles.actions}>
            <AppText>Confirme sua senha atual para carregar os dados desta sessão.</AppText>
            <Button title="Carregar meus dados" onPress={() => runOperation('load')} loading={busy === 'load'} disabled={!!busy} />
          </View>
        )}
        {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
        <View style={styles.actions}>
          <Button title="Salvar alterações" onPress={() => runOperation('save')} loading={busy === 'save'} disabled={!!busy || confirmDelete || !profileLoaded} />
          <Button title="Cancelar" variant="outline" onPress={() => confirmDelete ? setConfirmDelete(false) : router.back()} disabled={!!busy} />
          {confirmDelete ? (
            <View style={styles.actions}>
              <AppText variant="bodyBold" color={colors.danger}>Excluir sua conta permanentemente?</AppText>
              <AppText>Seus dados de cadastro serão apagados e você perderá o acesso à conta. Esta ação não pode ser desfeita.</AppText>
              <Button title="Confirmar exclusão da conta" style={{ backgroundColor: colors.danger }} onPress={() => runOperation('delete')} loading={busy === 'delete'} disabled={!!busy} />
            </View>
          ) : (
            <Button title="Excluir conta" style={{ backgroundColor: colors.danger }} onPress={() => { setMessage(''); setConfirmDelete(true); }} disabled={!!busy || !user} />
          )}
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


//MapLibre, OpenStreetMap, Valhalla ou OSRM, expo-location
