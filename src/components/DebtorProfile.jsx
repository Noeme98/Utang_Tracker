import { useLanguage } from '../i18n/LanguageProvider'
import {
  formatDate,
  formatPeso,
  getDebtorBalance,
  getDebtorStatus,
  getDebtorTransactions,
} from '../utils/helpers'

export default function DebtorProfile({
  debtor,
  transactions,
  onBack,
  onAddUtang,
  onAddBayad,
}) {
  const { t } = useLanguage()
  const balance = getDebtorBalance(debtor.id, transactions)
  const status = getDebtorStatus(debtor.id, transactions)
  const history = getDebtorTransactions(debtor.id, transactions)
  const statusLabel = (s) => t(`status.${s === 'fully-paid' ? 'fullyPaid' : s}`)

  return (
    <div className="page profile-page">
      <button type="button" className="btn-back" onClick={onBack}>
        {t('profile.back')}
      </button>

      <div className="profile-header">
        <h2>{debtor.name}</h2>
        {debtor.contact && <p className="profile-contact">{debtor.contact}</p>}
        <div className="profile-balance">
          <span className="profile-balance-label">{t('profile.currentBalance')}</span>
          <span className="profile-balance-amount">{formatPeso(Math.max(0, balance))}</span>
          <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
        </div>
      </div>

      <div className="profile-actions">
        <button type="button" className="btn btn-secondary" onClick={onAddUtang}>
          {t('profile.addUtang')}
        </button>
        <button type="button" className="btn btn-primary" onClick={onAddBayad}>
          {t('profile.addBayad')}
        </button>
      </div>

      <section className="section">
        <h3>{t('profile.transactionHistory')}</h3>
        {history.length === 0 ? (
          <div className="empty-state">
            <p>{t('profile.noTransactions')}</p>
          </div>
        ) : (
          <div className="timeline">
            {history.map((tx) => (
              <div key={tx.id} className={`timeline-item timeline-${tx.type}`}>
                <div className="timeline-icon">{tx.type === 'utang' ? '📦' : '💵'}</div>
                <div className="timeline-content">
                  <div className="timeline-top">
                    <span className="timeline-type">
                      {tx.type === 'utang' ? t('profile.utang') : t('profile.bayad')}
                    </span>
                    <span className={`timeline-amount ${tx.type === 'bayad' ? 'amount-credit' : ''}`}>
                      {tx.type === 'bayad' ? '−' : '+'}
                      {formatPeso(tx.amount)}
                    </span>
                  </div>
                  {tx.description && <p className="timeline-desc">{tx.description}</p>}
                  <span className="timeline-date">{formatDate(tx.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
