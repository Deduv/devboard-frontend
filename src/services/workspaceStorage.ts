const ACTIVE_WORKSPACE_KEY = 'activeOrganizationId';

export function getActiveOrganizationId(): number | null {
  const stored = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  if (!stored) return null;
  if (!/^[0-9]+$/.test(stored)) return null;
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? null : parsed;
}

export function setActiveOrganizationId(id: number): void {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, id.toString());
}

export function clearActiveOrganizationId(): void {
  localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
}
