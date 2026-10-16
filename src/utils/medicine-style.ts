import type { Ionicons } from '@expo/vector-icons';
import type { Medicine } from '@/constants/mock-data';
import type { Tone } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Cor e ícone de cada categoria vinda do banco, seguindo o design (dor laranja, gripe azul...).
const CATEGORY_STYLES: { match: RegExp; tone: Tone; icon: IconName }[] = [
  { match: /dor|febre|analg|antiterm|enxaq/, tone: 'orange', icon: 'thermometer-outline' },
  { match: /gripe|resfri|tosse|respir|nariz|garganta/, tone: 'blue', icon: 'rainy-outline' },
  { match: /alerg|antihist/, tone: 'purple', icon: 'flower-outline' },
  { match: /cora|cardi|press|hipert|colest/, tone: 'red', icon: 'heart-outline' },
  { match: /diabet|glic|insul/, tone: 'amber', icon: 'water-outline' },
  { match: /estom|gastr|digest|intest|antiac/, tone: 'amber', icon: 'nutrition-outline' },
  { match: /antibi|infec/, tone: 'blue', icon: 'shield-checkmark-outline' },
  { match: /inflam|muscul|artic/, tone: 'orange', icon: 'body-outline' },
  { match: /vitamin|suplem/, tone: 'green', icon: 'leaf-outline' },
];

export function categoryStyle(label: string): { tone: Tone; icon: IconName } {
  const text = normalize(label);
  return CATEGORY_STYLES.find(item => item.match.test(text)) ?? { tone: 'green', icon: 'medkit-outline' };
}

export function splitCategories(category: string) {
  return category.split(',').map(value => value.trim()).filter(value => value && value !== 'Sem categoria');
}

export function medicineDetail(medicine: Medicine, label: string) {
  const value = medicine.details?.find(field => field.label === label)?.value;
  return value && value !== 'Não informado' ? value : undefined;
}

export function requiresPrescription(medicine: Medicine) {
  return medicineDetail(medicine, 'Exige receita') === 'Sim';
}

export function medicineTitle(medicine: Pick<Medicine, 'name' | 'dosage'>) {
  return [medicine.name, medicine.dosage].filter(Boolean).join(' ');
}

export type PillKind = 'round' | 'capsule' | 'oval';
export function pillKind(medicine: Medicine): PillKind {
  const form = normalize(medicineDetail(medicine, 'Forma farmacêutica') ?? medicineDetail(medicine, 'Apresentação') ?? '');
  if (/capsul/.test(form)) return 'capsule';
  if (/comprim|dragea|pastilh/.test(form)) return 'round';
  return 'oval';
}

export function primaryTone(medicine: Medicine): Tone {
  return categoryStyle(splitCategories(medicine.category)[0] ?? '').tone;
}
