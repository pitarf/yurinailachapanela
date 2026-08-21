/**
 * Utilitário client & server safe para ordenação cronológica das atividades da programação
 */
export function sortActivitiesChronologically(activities: any[]) {
  if (!Array.isArray(activities)) return [];
  const parseTime = (t: string) => {
    if (!t) return 9999;
    const clean = t.trim().replace('h', ':').replace('H', ':');
    const parts = clean.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    return isNaN(hours) ? 9999 : hours * 60 + (isNaN(minutes) ? 0 : minutes);
  };

  return [...activities].sort((a, b) => {
    const timeDiff = parseTime(a.time) - parseTime(b.time);
    if (timeDiff !== 0) return timeDiff;
    return (a.order || 0) - (b.order || 0);
  });
}
