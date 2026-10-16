import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export type MascotId = 'broto' | 'lume' | 'luar';

export const MASCOTS: Record<MascotId, {
  id: MascotId; name: string; trait: string; description: string; top: string; bottom: string; soft: string; accent: string; pronoun: 'o' | 'a';
}> = {
  broto: {
    id: 'broto', name: 'Broto', trait: 'Calmo e organizado', pronoun: 'o',
    description: 'Lembra das doses, avisa quando um remédio está acabando e mantém tudo em ordem.',
    top: '#178A5E', bottom: '#D3EBDF', soft: '#E3F1EA', accent: '#0E6B50',
  },
  lume: {
    id: 'lume', name: 'Lume', trait: 'Energético e motivador', pronoun: 'o',
    description: 'Incentiva hábitos saudáveis, celebra suas conquistas e ajuda você a manter a motivação.',
    top: '#E2662B', bottom: '#F8D2BD', soft: '#FDEBE2', accent: '#C2501C',
  },
  luar: {
    id: 'luar', name: 'Luar', trait: 'Tranquila e acolhedora', pronoun: 'a',
    description: 'Incentiva o descanso, promove o bem-estar e lembra você de cuidar de si com carinho.',
    top: '#3D52C4', bottom: '#CDD6F7', soft: '#ECEBFB', accent: '#5B3FC4',
  },
};

function TopOrnament({ id, color }: { id: MascotId; color: string }) {
  if (id === 'lume') return <Path d="M50 4 C58 14 62 20 58 28 C56 32 53 33 50 33 C45 33 41 29 42 23 C43 19 46 18 46 14 C49 17 49 20 49 22 C52 18 52 10 50 4 Z" fill={color} />;
  if (id === 'luar') return <Path d="M54 6 A13 13 0 1 0 64 28 A10 10 0 1 1 54 6 Z" fill={color} />;
  return <G>
    <Path d="M50 32 C50 24 51 18 54 13" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" />
    <Path d="M54 14 C56 5 64 2 70 3 C69 10 63 16 54 14 Z" fill="#7FD4A6" />
  </G>;
}

function BottomOrnament({ id, color }: { id: MascotId; color: string }) {
  if (id === 'lume') return <Path d="M50 112 C55 118 57 122 55 127 C54 130 52 131 50 131 C47 131 44 128 45 124 C46 121 48 120 48 117 C50 119 50 121 50 122 C52 119 51 115 50 112 Z" fill={color} />;
  if (id === 'luar') return <Path d="M50 110 L53 119 L62 122 L53 125 L50 134 L47 125 L38 122 L47 119 Z" fill={color} />;
  return <G>
    <Rect x={46} y={113} width={8} height={20} rx={2} fill={color} />
    <Rect x={40} y={119} width={20} height={8} rx={2} fill={color} />
  </G>;
}

// Mascote de corpo inteiro (cápsula com olhos), usado no cadastro, boas-vindas e lembretes.
export function Mascot({ id = 'broto', size = 160, shadow = true }: { id?: MascotId; size?: number; shadow?: boolean }) {
  const m = MASCOTS[id];
  // A View mantém o desenho acima de halos posicionados (na web o SVG não cria camada).
  return <View><Svg width={size * (100 / 175)} height={size} viewBox="0 0 100 175" accessibilityLabel={`Mascote ${m.name}`}>
    {shadow && <Ellipse cx={50} cy={170} rx={26} ry={3.5} fill="rgba(0,0,0,0.12)" />}
    <TopOrnament id={id} color={id === 'broto' ? m.top : id === 'lume' ? '#F07A33' : '#4B5FD6'} />
    <Path d="M20 92 V62 A30 30 0 0 1 80 62 V92 Z" fill={m.top} />
    <Path d="M20 92 H80 V130 A30 30 0 0 1 20 130 Z" fill={m.bottom} />
    <Circle cx={40} cy={78} r={5.2} fill="#FFFFFF" />
    <Circle cx={60} cy={78} r={5.2} fill="#FFFFFF" />
    <Circle cx={41} cy={78.5} r={2.6} fill="#10241C" />
    <Circle cx={61} cy={78.5} r={2.6} fill="#10241C" />
    <BottomOrnament id={id} color={m.top} />
  </Svg></View>;
}

// Só a "cabeça" do mascote num quadrado arredondado, como um ícone de app.
export function MascotAvatar({ id = 'broto', size = 56, background }: { id?: MascotId; size?: number; background?: string }) {
  const m = MASCOTS[id];
  return <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={`Mascote ${m.name}`}>
    <Rect x={0} y={0} width={100} height={100} rx={26} fill={background ?? m.soft} />
    <G transform="translate(0 6)">
      {id === 'broto' ? <G>
        <Path d="M50 36 C50 30 51 25 54 21" stroke={m.top} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <Path d="M54 22 C56 13 64 10 70 11 C69 18 63 24 54 22 Z" fill="#5CC08C" />
      </G> : <G transform="translate(0 12) scale(1)"><TopOrnament id={id} color={m.top} /></G>}
      <Path d="M16 94 V68 A34 34 0 0 1 84 68 V94 Z" fill={m.top} />
      <Circle cx={41} cy={76} r={5.5} fill="#FFFFFF" />
      <Circle cx={59} cy={76} r={5.5} fill="#FFFFFF" />
      <Circle cx={42} cy={76.5} r={2.8} fill="#10241C" />
      <Circle cx={60} cy={76.5} r={2.8} fill="#10241C" />
    </G>
  </Svg>;
}

// Ícone compacto de cápsula bicolor usado nos botões de escolha de mascote.
export function MascotPill({ id, size = 26 }: { id: MascotId; size?: number }) {
  const m = MASCOTS[id];
  return <Svg width={size * 0.62} height={size} viewBox="0 0 31 50">
    <Path d="M2 25 V15 A13.5 13.5 0 0 1 29 15 V25 Z" fill={m.top} />
    <Path d="M2 25 H29 V35 A13.5 13.5 0 0 1 2 35 Z" fill={m.bottom} />
  </Svg>;
}
