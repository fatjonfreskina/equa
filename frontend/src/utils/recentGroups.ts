import type { Group } from '../api/groups'

const STORAGE_KEY = 'equa.recent-groups.v1'
const MAX_RECENT_GROUPS = 20

export interface RecentGroup {
  id: string
  name: string
  description?: string
  currency: string
  lastAccessedAt: string
  memberCount: number
  expenseCount: number
}

export function getRecentGroups(): RecentGroup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const groups: unknown = JSON.parse(stored)
    if (!Array.isArray(groups)) return []

    return groups
      .filter(isValidRecentGroup)
      .sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt))
  } catch {
    return []
  }
}

export function saveRecentGroup(group: Group): RecentGroup[] {
  const recentGroup: RecentGroup = {
    id: group.id,
    name: group.name,
    description: group.description,
    currency: group.currency,
    lastAccessedAt: new Date().toISOString(),
    memberCount: group.members.length,
    expenseCount: group.expenses.length,
  }

  const groups = [recentGroup, ...getRecentGroups().filter((item) => item.id !== group.id)].slice(
    0,
    MAX_RECENT_GROUPS,
  )
  persist(groups)
  return groups
}

export function removeRecentGroup(groupId: string): RecentGroup[] {
  const groups = getRecentGroups().filter((group) => group.id !== groupId)
  persist(groups)
  return groups
}

export function clearRecentGroups() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // L'app resta utilizzabile anche quando il browser blocca lo storage locale.
  }
}

export function isRecentGroup(groupId: string) {
  return getRecentGroups().some((group) => group.id === groupId)
}

function persist(groups: RecentGroup[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // L'app resta utilizzabile anche quando il browser blocca lo storage locale.
  }
}

function isValidRecentGroup(value: unknown): value is RecentGroup {
  if (!value || typeof value !== 'object') return false

  const group = value as Record<string, unknown>
  return (
    typeof group.id === 'string' &&
    typeof group.name === 'string' &&
    typeof group.currency === 'string' &&
    typeof group.lastAccessedAt === 'string' &&
    typeof group.memberCount === 'number' &&
    typeof group.expenseCount === 'number'
  )
}
