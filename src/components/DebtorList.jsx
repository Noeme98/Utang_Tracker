import { useLanguage } from '../i18n/LanguageProvider'
import { formatPeso, getDebtorBalance, getDebtorStatus } from '../utils/helpers'

export default function DebtorList({ debtors, transactions, onSelectDebtor, onAddDebtor }) {
  const { t } = useLanguage()
  const statusLabel = (status) => t(`status.${status === 'fully-paid' ? 'fullyPaid' : status}`)

  const sorted = [...debtors]
    .map((d) => ({
      ...d,
      balance: getDebtorBalance(d.id, transactions),
      status: getDebtorStatus(d.id, transactions),
    }))
    .sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name))

  return (
    <div className="page">
      <div className="page-actions">
        <button type="button" className="btn btn-primary" onClick={onAddDebtor}>
          {t('debtors.addDebtor')}
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>{t('debtors.noDebtors')}</p>
          <p className="empty-hint">{t('debtors.addFirst')}</p>
        </div>
      ) : (
        <div className="card-list">
          {sorted.map((d) => (
            <button
              key={d.id}
              type="button"
              className="list-card list-card-clickable"
              onClick={() => onSelectDebtor(d.id)}
            >
              <div className="list-card-body">
                <div className="list-card-main">
                  <span className="list-card-title">{d.name}</span>
                  <span className={`badge badge-${d.status}`}>{statusLabel(d.status)}</span>
                </div>
                {d.contact && <span className="list-card-sub">{d.contact}</span>}
              </div>
              <span className={`list-card-amount ${d.balance <= 0 ? 'amount-paid' : ''}`}>
                {formatPeso(Math.max(0, d.balance))}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
