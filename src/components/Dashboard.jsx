import { useLanguage } from '../i18n/LanguageProvider'
import {
  formatPeso,
  getDashboardStats,
  getDebtorBalance,
  getDebtorStatus,
} from '../utils/helpers'

export default function Dashboard({ debtors, transactions, onViewDebtors, onSelectDebtor }) {
  const { t } = useLanguage()
  const stats = getDashboardStats(debtors, transactions)
  const statusLabel = (status) => t(`status.${status === 'fully-paid' ? 'fullyPaid' : status}`)

  const recentDebtors = [...debtors]
    .map((d) => ({
      ...d,
      balance: getDebtorBalance(d.id, transactions),
      status: getDebtorStatus(d.id, transactions),
    }))
    .filter((d) => d.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)

  return (
    <motion className="page">
      <section className="stats-grid">
        <div className="stat-card stat-primary">
          <span className="stat-label">{t('dashboard.totalUtang')}</span>
          <span className="stat-value">{formatPeso(stats.totalUtang)}</span>
        </div>
        <motion className="stat-card">
          <span className="stat-label">{t('dashboard.activeDebtors')}</span>
          <span className="stat-value">{stats.activeDebtors}</span>
        </motion>
        <div className="stat-card">
          <span className="stat-label">{t('dashboard.collectedMonth')}</span>
          <span className="stat-value stat-success">{formatPeso(stats.collectedThisMonth)}</span>
        </div>
        <div className="stat-card stat-warning">
          <span className="stat-label">{t('dashboard.overdue')}</span>
          <span className="stat-value">{stats.overdueCount}</span>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>{t('dashboard.stillOwing')}</h2>
          {debtors.length > 0 && (
            <button type="button" className="btn-link" onClick={onViewDebtors}>
              {t('seeAll')}
            </button>
          )}
        </div>
        {recentDebtors.length === 0 ? (
          <div className="empty-state">
            <p>{t('dashboard.noUtang')}</p>
          </div>
        ) : (
          <div className="card-list">
            {recentDebtors.map((d) => (
              <button
                key={d.id}
                type="button"
                className="list-card list-card-clickable"
                onClick={() => onSelectDebtor(d.id)}
              >
                <div className="list-card-main">
                  <span className="list-card-title">{d.name}</span>
                  <span className={`badge badge-${d.status}`}>{statusLabel(d.status)}</span>
                </div>
                <span className="list-card-amount">{formatPeso(d.balance)}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </motion>
  )
}

function motion({ className, children }) {
  return <div className={className}>{children}</div>
}
