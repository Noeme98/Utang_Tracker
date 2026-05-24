import { getMessage } from '../i18n/LanguageProvider'

const LANG_KEY = 'utang-tracker-lang'

function lang() {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'fil'
}

export function mapDebtor(row) {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact ?? '',
    createdAt: row.created_at,
  }
}

export function mapTransaction(row) {
  return {
    id: row.id,
    debtorId: row.debtor_id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description ?? '',
    date: row.date,
    createdAt: row.created_at,
  }
}

export function mapStoreItem(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function authErrorMessage(error) {
  const l = lang()
  const code = error?.code
  const msg = error?.message ?? ''

  if (code === 'USERNAME_EXISTS' || code === 'EMAIL_EXISTS' || msg.includes('User already registered')) {
    return getMessage(l, 'errors.nameExists')
  }
  if (code === 'INVALID_USERNAME') {
    return getMessage(l, 'errors.invalidUsername')
  }
  if (code === 'NAME_REQUIRED') {
    return getMessage(l, 'auth.nameRequired')
  }
  if (code === 'INVALID_CREDENTIALS' || msg.includes('Invalid login credentials')) {
    return getMessage(l, 'errors.invalidCredentials')
  }
  if (code === 'USER_NOT_FOUND') {
    return getMessage(l, 'errors.userNotFound')
  }
  if (msg.includes('Password should be at least')) {
    return getMessage(l, 'auth.passwordMin')
  }

  return msg || getMessage(l, 'errors.generic')
}
