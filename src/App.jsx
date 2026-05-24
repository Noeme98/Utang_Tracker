import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useUtangStore } from './hooks/useUtangStore'
import { useStoreItems } from './hooks/useStoreItems'
import { useLanguage } from './i18n/LanguageProvider'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'
import DebtorList from './components/DebtorList'
import DebtorProfile from './components/DebtorProfile'
import AddDebtorForm from './components/AddDebtorForm'
import AddUtangForm from './components/AddUtangForm'
import AddBayadForm from './components/AddBayadForm'
import PriceList from './components/PriceList'
import Settings from './components/Settings'
import './App.css'

export default function App() {
  const { user, loading, signup, login, logout, updateProfile, isAuthenticated } = useAuth()
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="loading-spinner" />
        <p>{t('loading')}</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen onSignup={signup} onLogin={login} />
  }

  return <MainApp user={user} onLogout={logout} onUpdateName={updateProfile} />
}

function MainApp({ user, onLogout, onUpdateName }) {
  const { t } = useLanguage()
  const [view, setView] = useState('dashboard')
  const { debtors, transactions, loading, error, reload, addDebtor, addUtang, addBayad } =
    useUtangStore(user.id)
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    reload: reloadItems,
    saveItem,
    deleteItem,
  } = useStoreItems(user.id, view === 'prices' || view === 'settings')
  const [selectedDebtorId, setSelectedDebtorId] = useState(null)
  const [modal, setModal] = useState(null)
  const [showActions, setShowActions] = useState(false)

  const selectedDebtor = debtors.find((d) => d.id === selectedDebtorId)

  const viewKeys = {
    dashboard: 'views.dashboard',
    debtors: 'views.debtors',
    prices: 'views.prices',
    settings: 'views.settings',
    profile: 'views.profile',
  }

  function openProfile(debtorId) {
    setSelectedDebtorId(debtorId)
    setView('profile')
  }

  function goBack() {
    setSelectedDebtorId(null)
    setView('debtors')
  }

  function openModal(type, debtorId = null) {
    setShowActions(false)
    setModal({ type, debtorId })
  }

  function closeModal() {
    setModal(null)
  }

  const pageTitle =
    view === 'profile' && selectedDebtor
      ? selectedDebtor.name
      : t(viewKeys[view] || 'views.dashboard')

  const showNav =
    view !== 'profile' && (view === 'prices' || view === 'settings' || (!loading && !error))

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo">🏪</span>
          <div>
            <h1>{t('storeOf')} {user.name}</h1>
            <p className="app-subtitle">{pageTitle}</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`btn-header-icon ${view === 'settings' ? 'active' : ''}`}
            onClick={() => setView('settings')}
            title={t('nav.settings')}
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className={`app-main ${view === 'profile' ? 'app-main-profile' : ''}`}>
        {view === 'settings' ? (
          <Settings
            user={user}
            debtors={debtors}
            transactions={transactions}
            items={items}
            onUpdateName={onUpdateName}
            onLogout={onLogout}
          />
        ) : view === 'prices' ? (
          <PriceList
            items={items}
            loading={itemsLoading}
            error={itemsError}
            onSaveItem={saveItem}
            onDeleteItem={deleteItem}
            onReload={reloadItems}
          />
        ) : loading ? (
          <div className="loading-inline">
            <span className="loading-spinner" />
            <p>{t('loadingData')}</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={reload}>
              {t('tryAgain')}
            </button>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard
                debtors={debtors}
                transactions={transactions}
                onViewDebtors={() => setView('debtors')}
                onSelectDebtor={openProfile}
              />
            )}
            {view === 'debtors' && (
              <DebtorList
                debtors={debtors}
                transactions={transactions}
                onSelectDebtor={openProfile}
                onAddDebtor={() => openModal('debtor')}
              />
            )}
            {view === 'profile' && selectedDebtor && (
              <DebtorProfile
                debtor={selectedDebtor}
                transactions={transactions}
                onBack={goBack}
                onAddUtang={() => openModal('utang', selectedDebtorId)}
                onAddBayad={() => openModal('bayad', selectedDebtorId)}
              />
            )}
          </>
        )}
      </main>

      {showNav && (
        <nav className="bottom-nav bottom-nav-4">
          <button
            type="button"
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>{t('nav.home')}</span>
          </button>
          <button
            type="button"
            className={`nav-item ${view === 'debtors' ? 'active' : ''}`}
            onClick={() => setView('debtors')}
          >
            <span className="nav-icon">👥</span>
            <span>{t('nav.debtors')}</span>
          </button>
          <button
            type="button"
            className="nav-item nav-fab"
            onClick={() => setShowActions((s) => !s)}
            aria-label={t('actions.quickActions')}
          >
            <span className="fab-icon">{showActions ? '✕' : '+'}</span>
          </button>
          <button
            type="button"
            className={`nav-item ${view === 'prices' ? 'active' : ''}`}
            onClick={() => setView('prices')}
          >
            <span className="nav-icon">🏷️</span>
            <span>{t('nav.prices')}</span>
          </button>
        </nav>
      )}

      {showActions && (
        <div className="action-sheet-overlay" onClick={() => setShowActions(false)} role="presentation">
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="action-item" onClick={() => openModal('debtor')}>
              <span>👤</span> {t('actions.newDebtor')}
            </button>
            <button type="button" className="action-item" onClick={() => openModal('utang')}>
              <span>📦</span> {t('actions.newUtang')}
            </button>
            <button type="button" className="action-item" onClick={() => openModal('bayad')}>
              <span>💵</span> {t('actions.recordBayad')}
            </button>
          </div>
        </div>
      )}

      {modal?.type === 'debtor' && (
        <AddDebtorForm onClose={closeModal} onSubmit={addDebtor} />
      )}
      {modal?.type === 'utang' && (
        <AddUtangForm
          debtors={debtors}
          preselectedDebtorId={modal.debtorId}
          onClose={closeModal}
          onSubmit={addUtang}
        />
      )}
      {modal?.type === 'bayad' && (
        <AddBayadForm
          debtors={debtors}
          transactions={transactions}
          preselectedDebtorId={modal.debtorId}
          onClose={closeModal}
          onSubmit={addBayad}
        />
      )}
    </div>
  )
}
