export const STORAGE_KEY = 'utang-tracker-data'

export function generateId() {
  return crypto.randomUUID()
}

/** Login id derived from display name (e.g. "Maria Santos" → "maria.santos") */
export function toLoginId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

export function formatPeso(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function daysBetween(fromDate, toDate = new Date()) {
  const from = new Date(fromDate + 'T00:00:00')
  const to = new Date(toDate)
  to.setHours(0, 0, 0, 0)
  return Math.floor((to - from) / (1000 * 60 * 60 * 24))
}

export function getDebtorBalance(debtorId, transactions) {
  return transactions
    .filter((t) => t.debtorId === debtorId)
    .reduce((sum, t) => {
      if (t.type === 'utang') return sum + t.amount
      if (t.type === 'bayad') return sum - t.amount
      return sum
    }, 0)
}

export function getDebtorTransactions(debtorId, transactions) {
  return transactions
    .filter((t) => t.debtorId === debtorId)
    .sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date)
      if (dateDiff !== 0) return dateDiff
      return b.createdAt.localeCompare(a.createdAt)
    })
}

export function getLastPaymentDate(debtorId, transactions) {
  const payments = transactions
    .filter((t) => t.debtorId === debtorId && t.type === 'bayad')
    .sort((a, b) => b.date.localeCompare(a.date))
  return payments[0]?.date ?? null
}

export function getDebtorStatus(debtorId, transactions) {
  const balance = getDebtorBalance(debtorId, transactions)
  if (balance <= 0) return 'fully-paid'

  const lastPayment = getLastPaymentDate(debtorId, transactions)
  if (lastPayment) {
    return daysBetween(lastPayment) >= 7 ? 'overdue' : 'active'
  }

  const utangEntries = transactions
    .filter((t) => t.debtorId === debtorId && t.type === 'utang')
    .sort((a, b) => b.date.localeCompare(a.date))

  const referenceDate = utangEntries[0]?.date
  if (referenceDate && daysBetween(referenceDate) >= 7) return 'overdue'

  return 'active'
}

export function getDashboardStats(debtors, transactions) {
  const totalUtang = debtors.reduce(
    (sum, d) => sum + Math.max(0, getDebtorBalance(d.id, transactions)),
    0,
  )

  const activeDebtors = debtors.filter(
    (d) => getDebtorBalance(d.id, transactions) > 0,
  ).length

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const collectedThisMonth = transactions
    .filter((t) => t.type === 'bayad' && t.date >= monthStart)
    .reduce((sum, t) => sum + t.amount, 0)

  const overdueCount = debtors.filter(
    (d) => getDebtorStatus(d.id, transactions) === 'overdue',
  ).length

  return { totalUtang, activeDebtors, collectedThisMonth, overdueCount }
}

export const STATUS_LABELS = {
  active: 'Active',
  overdue: 'Overdue',
  'fully-paid': 'Fully Paid',
}
