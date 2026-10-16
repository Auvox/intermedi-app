const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// "Quinta, 15 de outubro"
export function longDate(date = new Date()) {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

// "9 a 15 de outubro" (ou "28 de setembro a 4 de outubro")
export function weekRange(end = new Date()) {
  const start = new Date(end); start.setDate(end.getDate() - 6);
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()} a ${end.getDate()} de ${MONTHS[end.getMonth()]}`
    : `${start.getDate()} de ${MONTHS[start.getMonth()]} a ${end.getDate()} de ${MONTHS[end.getMonth()]}`;
}

export function lastDays(count: number, end = new Date()) {
  return Array.from({ length: count }, (_, i) => { const d = new Date(end); d.setDate(end.getDate() - (count - 1 - i)); return d; });
}
