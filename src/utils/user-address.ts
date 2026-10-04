import type { LoggedUser } from '@/context/user-context';

export function formatUserAddress(user: LoggedUser | null, full = false): string {
  if (!user) return '';
  const street = [user.ruaPaciente?.trim(), user.numeroPaciente?.trim()].filter(Boolean).join(', ');
  const city = [user.cidadePaciente?.trim(), user.estadoPaciente?.trim()].filter(Boolean).join(' - ');
  if (!full) return street || user.bairroPaciente?.trim() || city || user.cepPaciente?.trim() || '';
  return [street, user.complementoPaciente?.trim(), user.bairroPaciente?.trim(), city, user.cepPaciente?.trim()]
    .filter(Boolean).join(' · ');
}
