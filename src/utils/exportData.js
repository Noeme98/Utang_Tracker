import { formatPeso } from './helpers'

function escapeCsv(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function downloadCsv(filename, rows) {
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportStoreData({ debtors, transactions, items, storeName }) {
  const date = new Date().toISOString().slice(0, 10)
  const safeName = (storeName || 'store').replace(/\s+/g, '-').toLowerCase()

  const debtorRows = [
    'Type,Name,Contact,Balance',
    ...debtors.map((d) => {
      const balance = transactions
        .filter((t) => t.debtorId === d.id)
        .reduce((sum, t) => sum + (t.type === 'utang' ? t.amount : -t.amount), 0)
      return ['Debtor', escapeCsv(d.name), escapeCsv(d.contact), Math.max(0, balance)].join(',')
    }),
  ]

  const txRows = [
    'Type,Debtor,Amount,Description,Date',
    ...transactions.map((t) => {
      const debtor = debtors.find((d) => d.id === t.debtorId)
      return [
        t.type,
        escapeCsv(debtor?.name ?? ''),
        t.amount,
        escapeCsv(t.description),
        t.date,
      ].join(',')
    }),
  ]

  const itemRows = [
    'Item,Price',
    ...items.map((item) => [escapeCsv(item.name), item.price].join(',')),
  ]

  const combined = [
    `# Utang Tracker Export - ${date}`,
    '',
    '# Debtors',
    ...debtorRows,
    '',
    '# Transactions',
    ...txRows,
    '',
    '# Store Items / Prices',
    ...itemRows,
  ]

  downloadCsv(`utang-tracker-${safeName}-${date}.csv`, combined)
}
