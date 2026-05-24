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
  const msg = error?.message ?? 'May error. Subukan ulit.'

  if (msg.includes('Invalid login credentials')) {
    return 'Mali ang email o password.'
  }
  if (msg.includes('User already registered')) {
    return 'May account na sa email na ito.'
  }
  if (msg.includes('Password should be at least')) {
    return 'Ang password ay dapat 6 characters pataas.'
  }
  if (msg.includes('Unable to validate email')) {
    return 'Maglagay ng valid na email.'
  }
  if (msg.includes('Email not confirmed')) {
    return 'I-confirm muna ang email mo bago mag-log in.'
  }
  if (msg.includes('Could not find the table')) {
    return 'Hindi pa naka-setup ang database. I-run ang supabase/schema.sql sa Supabase SQL Editor.'
  }
  if (msg.includes('store_items')) {
    return 'Kailangan i-run ang store_items migration sa Supabase SQL Editor.'
  }

  return msg
}
