export const KEYS = {
  USERS: 'utang-tracker-users',
  SESSION: 'utang-tracker-session',
  DEBTORS: 'utang-tracker-debtors',
  TRANSACTIONS: 'utang-tracker-transactions',
  STORE_ITEMS: 'utang-tracker-store_items',
}

export function getData(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function getSession() {
  try {
    const raw = localStorage.getItem(KEYS.SESSION)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession(session) {
  if (session) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session))
  } else {
    localStorage.removeItem(KEYS.SESSION)
  }
}
