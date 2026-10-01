import { useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiAssetUrl } from '@/constants/api';
import { Colors, Radius } from '@/constants/theme';
export function PharmacyPhoto({ photo, name }: { photo?: string | null; name: string }) {
  return <Photo key={photo || 'sem-foto'} photo={photo} name={name} />;
}
function Photo({ photo, name }: { photo?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const uri = getApiAssetUrl(photo);
  return <View style={{ width: 60, height: 60, borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
    {uri && !failed ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={`Foto de ${name}`} onError={() => setFailed(true)} /> : <Ionicons name="business" size={28} color={Colors.textOnPrimary} />}
  </View>;
}