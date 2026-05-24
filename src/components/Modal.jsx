import { useLanguage } from '../i18n/LanguageProvider'

export default function Modal({ title, onClose, children }) {
  const { t } = useLanguage()

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label={t('close')}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
