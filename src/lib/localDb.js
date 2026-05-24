import { generateId, toLoginId } from '../utils/helpers'
import { getData, getSession, KEYS, saveData, saveSession } from './storage'

function getUsername(user) {
  return (user.username ?? user.email ?? '').toLowerCase()
}

function resolveLoginKey(input) {
  const slug = toLoginId(input)
  if (slug) return slug
  return input.trim().toLowerCase()
}

// --- Auth / profiles ---

export function getCurrentUserId() {
  return getSession()?.userId ?? null
}

export function findUserByUsername(username) {
  const users = getData(KEYS.USERS)
  const key = username.trim().toLowerCase()
  return users.find((u) => getUsername(u) === key) ?? null
}

export function findUserByLoginInput(input) {
  const key = resolveLoginKey(input)
  if (!key) return null
  return findUserByUsername(key)
}

export function findUserById(id) {
  const users = getData(KEYS.USERS)
  return users.find((u) => u.id === id) ?? null
}

export function createUser(displayName, password) {
  const users = getData(KEYS.USERS)
  const name = displayName.trim()
  const username = toLoginId(name)

  if (!name) {
    return { error: { code: 'NAME_REQUIRED' } }
  }
  if (!username) {
    return { error: { code: 'INVALID_USERNAME' } }
  }
  if (users.some((u) => getUsername(u) === username)) {
    return { error: { code: 'USERNAME_EXISTS' } }
  }

  const user = {
    id: generateId(),
    name,
    username,
    password,
    created_at: new Date().toISOString(),
  }

  saveData(KEYS.USERS, [...users, user])
  return { user }
}

export function verifyLogin(loginInput, password) {
  const user = findUserByLoginInput(loginInput)
  if (!user || user.password !== password) {
    return { error: { code: 'INVALID_CREDENTIALS' } }
  }
  return { user }
}

export function setActiveSession(userId) {
  saveSession({ userId })
}

export function clearSession() {
  saveSession(null)
}

export function updateUserProfile(userId, displayName) {
  const users = getData(KEYS.USERS)
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return { error: { code: 'USER_NOT_FOUND' } }

  const name = displayName.trim()
  const username = toLoginId(name)
  if (!name) return { error: { code: 'NAME_REQUIRED' } }
  if (!username) return { error: { code: 'INVALID_USERNAME' } }

  const taken = users.some(
    (u, i) => i !== index && getUsername(u) === username,
  )
  if (taken) return { error: { code: 'USERNAME_EXISTS' } }

  const updated = [...users]
  updated[index] = { ...updated[index], name, username }
  saveData(KEYS.USERS, updated)
  return { user: updated[index] }
}

export function toProfile(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username ?? user.email ?? '',
  }
}

// --- Debtors ---

export function getDebtorsByUser(userId) {
  return getData(KEYS.DEBTORS)
    .filter((d) => d.user_id === userId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}

export function insertDebtor(userId, name, contact) {
  const debtors = getData(KEYS.DEBTORS)
  const row = {
    id: generateId(),
    user_id: userId,
    name: name.trim(),
    contact: contact?.trim() || '',
    created_at: new Date().toISOString(),
  }
  saveData(KEYS.DEBTORS, [...debtors, row])
  return row
}

// --- Transactions ---

export function getTransactionsByUser(userId) {
  return getData(KEYS.TRANSACTIONS)
    .filter((t) => t.user_id === userId)
    .sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date)
      if (dateDiff !== 0) return dateDiff
      return b.created_at.localeCompare(a.created_at)
    })
}

export function insertTransaction(userId, debtorId, type, amount, description, date) {
  const transactions = getData(KEYS.TRANSACTIONS)
  const row = {
    id: generateId(),
    user_id: userId,
    debtor_id: debtorId,
    type,
    amount: Number(amount),
    description: description?.trim() || '',
    date,
    created_at: new Date().toISOString(),
  }
  saveData(KEYS.TRANSACTIONS, [...transactions, row])
  return row
}

// --- Store items ---

export function getStoreItemsByUser(userId) {
  return getData(KEYS.STORE_ITEMS)
    .filter((i) => i.user_id === userId)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function upsertStoreItem(userId, name, price) {
  const items = getData(KEYS.STORE_ITEMS)
  const trimmedName = name.trim()
  const numPrice = Number(price)
  const index = items.findIndex(
    (i) => i.user_id === userId && i.name.toLowerCase() === trimmedName.toLowerCase(),
  )

  if (index >= 0) {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      price: numPrice,
      updated_at: new Date().toISOString(),
    }
    saveData(KEYS.STORE_ITEMS, updated)
    return updated[index]
  }

  const row = {
    id: generateId(),
    user_id: userId,
    name: trimmedName,
    price: numPrice,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  saveData(KEYS.STORE_ITEMS, [...items, row])
  return row
}

export function deleteStoreItem(itemId) {
  const items = getData(KEYS.STORE_ITEMS)
  saveData(
    KEYS.STORE_ITEMS,
    items.filter((i) => i.id !== itemId),
  )
}
