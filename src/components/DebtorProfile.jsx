import {
  formatDate,
  formatPeso,
  getDebtorBalance,
  getDebtorStatus,
  getDebtorTransactions,
  STATUS_LABELS,
} from '../utils/helpers'

export default function DebtorProfile({
  debtor,
  transactions,
  onBack,
  onAddUtang,
  onAddBayad,
}) {
  const balance = getDebtorBalance(debtor.id, transactions)
  const status = getDebtorStatus(debtor.id, transactions)
  const history = getDebtorTransactions(debtor.id, transactions)

  return (
    <div className="page profile-page">
      <button type="button" className="btn-back" onClick={onBack}>
        ← Bumalik
      </button>

      <div className="profile-header">
        <h2>{debtor.name}</h2>
        {debtor.contact && <p className="profile-contact">{debtor.contact}</p>}
        <div className="profile-balance">
          <span className="profile-balance-label">Current Balance</span>
          <span className="profile-balance-amount">{formatPeso(Math.max(0, balance))}</span>
          <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>
        </div>
      </div>

      <div className="profile-actions">
        <button type="button" className="btn btn-secondary" onClick={onAddUtang}>
          + Utang
        </button>
        <button type="button" className="btn btn-primary" onClick={onAddBayad}>
          + Bayad
        </button>
      </div>

      <section className="section">
        <h3>Transaction History</h3>
        {history.length === 0 ? (
          <div className="empty-state">
            <p>Walang transaction pa.</p>
          </div>
        ) : (
          <div className="timeline">
            {history.map((t) => (
              <div key={t.id} className={`timeline-item timeline-${t.type}`}>
                <div className="timeline-icon">{t.type === 'utang' ? '📦' : '💵'}</div>
                <div className="timeline-content">
                  <div className="timeline-top">
                    <span className="timeline-type">
                      {t.type === 'utang' ? 'Utang' : 'Bayad'}
                    </span>
                    <span className={`timeline-amount ${t.type === 'bayad' ? 'amount-credit' : ''}`}>
                      {t.type === 'bayad' ? '−' : '+'}
                      {formatPeso(t.amount)}
                    </span>
                  </div>
                  {t.description && <p className="timeline-desc">{t.description}</p>}
                  <span className="timeline-date">{formatDate(t.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
