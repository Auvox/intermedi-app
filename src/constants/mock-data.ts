import type { Ionicons } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const currentUser = {
  firstName: 'Matheus',
};

export type Category = {
  id: string;
  label: string;
  icon: IoniconName;
};

export const categories: Category[] = [
  { id: 'dor-febre', label: 'Dor e Febre', icon: 'medkit-outline' },
  { id: 'gripe-resfriado', label: 'Gripe e Resfriado', icon: 'thermometer-outline' },
  { id: 'alergias', label: 'Alergias', icon: 'flower-outline' },
  { id: 'vitaminas', label: 'Vitaminas', icon: 'nutrition-outline' },
  { id: 'primeiros-socorros', label: 'Primeiros Socorros', icon: 'bandage-outline' },
];

export type PharmacyStatus = 'em-estoque' | 'poucas-unidades' | 'indisponivel';

export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  status: PharmacyStatus;
};

export const pharmacyStatusLabel: Record<PharmacyStatus, string> = {
  'em-estoque': 'Em estoque',
  'poucas-unidades': 'Poucas unidades',
  indisponivel: 'Indisponível',
};

export const pharmacies: Pharmacy[] = [
  {
    id: 'ubs-guaianases-ii',
    name: 'UBS Guaianases II',
    address: 'R. Comandante Carlos Ruhl, 189 - Guaianases, São Paulo - SP',
    hours: 'Seg. a sex., das 7h às 19h',
    phone: '(11) 2554-4064',
    status: 'em-estoque',
  },
  {
    id: 'ubs-jardim-soares',
    name: 'UBS Jardim Soares',
    address: 'R. Feliciano de Mendonça, 496 - Jardim Soares, São Paulo - SP',
    hours: 'Seg. a sex., das 7h às 19h',
    phone: '(11) 2557-7022',
    status: 'indisponivel',
  },
];

export type Medicine = {
  id: string;
  name: string;
  dosage: string;
  category: string;
  description: string;
  pharmacyIds: string[];
};

export const medicines: Medicine[] = [
  {
    id: 'ibuprofeno-600',
    name: 'Ibuprofeno',
    dosage: '600mg',
    category: 'Anti-inflamatório não esteroidal',
    description: 'Ibuprofeno é indicado para o alívio da dor, inflamação e febre.',
    pharmacyIds: ['ubs-guaianases-ii', 'ubs-jardim-soares'],
  },
  {
    id: 'dipirona-500',
    name: 'Dipirona',
    dosage: '500mg',
    category: 'Analgésicos e antitérmicos',
    description: 'Dipirona é indicada para o alívio da dor e febre.',
    pharmacyIds: ['ubs-guaianases-ii', 'ubs-jardim-soares'],
  },
];

export function getMedicineById(id: string) {
  return medicines.find((medicine) => medicine.id === id);
}

export function getPharmacyById(id: string) {
  return pharmacies.find((pharmacy) => pharmacy.id === id);
}

export type SavedAddress = {
  id: string;
  label: string;
  address: string;
  icon: IoniconName;
};

export const savedAddresses: SavedAddress[] = [
  { id: 'casa', label: 'Casa', address: 'Etec Guaianases', icon: 'home-outline' },
  { id: 'apartamento', label: 'Apartamento', address: 'R. dos Pinheiros, 987', icon: 'business-outline' },
];

export const currentLocation = {
  label: 'Usar localização atual',
  address: 'Etec Guaianases',
};

export const favoritePharmacies: Pharmacy[] = [pharmacies[0]];

export const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
