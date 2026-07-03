import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cookie-consent.css';

type Consent = {
  necessary: true;
  analytics: boolean;
  personalization: boolean;
  updatedAt: string;
};

const STORAGE_KEY = 'voevoda_cookie_consent_v1';

function readConsent(): Consent | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Consent | null;
    return parsed?.necessary === true ? parsed : null;
  } catch {
    return null;
  }
}

function applyConsent(consent: Consent) {
  document.documentElement.dataset.analyticsConsent = String(consent.analytics);
  document.documentElement.dataset.personalizationConsent = String(consent.personalization);
  window.dispatchEvent(new CustomEvent('voevoda:consent-changed', { detail: consent }));
}

export function CookieConsent() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Consent | null>(() => readConsent());
  const [visible, setVisible] = useState(() => !readConsent());
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? false);
  const [personalization, setPersonalization] = useState(() => readConsent()?.personalization ?? false);

  const openSettings = useCallback(() => {
    const current = readConsent();
    setAnalytics(current?.analytics ?? false);
    setPersonalization(current?.personalization ?? false);
    setSettings(true);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (saved) applyConsent(saved);
  }, [saved]);

  useEffect(() => {
    window.addEventListener('voevoda:cookie-settings', openSettings);
    return () => window.removeEventListener('voevoda:cookie-settings', openSettings);
  }, [openSettings]);

  const save = (nextAnalytics: boolean, nextPersonalization: boolean) => {
    const next: Consent = { necessary: true, analytics: nextAnalytics, personalization: nextPersonalization, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* privacy mode can block storage */ }
    setSaved(next);
    applyConsent(next);
    setVisible(false);
    setSettings(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-layer" role="dialog" aria-modal={settings} aria-labelledby="cookie-title">
      {settings && <div className="cookie-backdrop" onClick={() => saved && setVisible(false)} />}
      <section className={`cookie-card${settings ? ' is-settings' : ''}`}>
        <div className="cookie-mark" aria-hidden="true">
          <span />
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none"><path d="M20 13.2A8.5 8.5 0 0 1 10.8 4a6 6 0 1 0 9.2 9.2Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="13.5" cy="16" r="1" fill="currentColor"/><circle cx="14" cy="10" r=".9" fill="currentColor"/></svg>
        </div>
        <div className="cookie-copy">
          <div className="cookie-kicker">{settings ? 'Центр приватности' : 'Настройки сайта'}</div>
          <h2 id="cookie-title">{settings ? 'Выберите, какие cookie разрешить' : 'Мы используем cookie'}</h2>
          <p>
            {settings
              ? 'Обязательные cookie нужны для работы портала. Остальные категории можно включить или отключить отдельно.'
              : 'Они помогают безопасно войти в аккаунт, сохранить настройки и сделать портал удобнее. Необязательные cookie включим только с вашего согласия.'}
          </p>

          {!settings && (
            <div className="cookie-benefits" aria-label="Для чего нужны cookie">
              <span><i className="cookie-benefit-icon">✓</i>Безопасный вход</span>
              <span><i className="cookie-benefit-icon">✓</i>Ваши настройки</span>
              <span><i className="cookie-benefit-icon">✓</i>Улучшение портала</span>
            </div>
          )}

          <button type="button" className="cookie-policy-link" onClick={() => { setVisible(false); navigate('/cookies'); }}>Что такое cookie и какие данные используются <span>→</span></button>

          {settings && (
            <div className="cookie-options">
              <div className="cookie-option">
                <div><strong>Обязательные</strong><span>Авторизация, безопасность, корзина и сохранение выбора.</span></div>
                <span className="cookie-required">Всегда</span>
              </div>
              <label className="cookie-option">
                <div><strong>Аналитика</strong><span>Обезличенная статистика для улучшения страниц.</span></div>
                <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
                <span className="cookie-switch" />
              </label>
              <label className="cookie-option">
                <div><strong>Персонализация</strong><span>Запоминает необязательные предпочтения интерфейса.</span></div>
                <input type="checkbox" checked={personalization} onChange={e => setPersonalization(e.target.checked)} />
                <span className="cookie-switch" />
              </label>
            </div>
          )}
        </div>
        <div className="cookie-actions">
          {settings ? (
            <>
              <button type="button" className="cookie-secondary" onClick={() => save(false, false)}>Только обязательные</button>
              <button type="button" className="cookie-primary" onClick={() => save(analytics, personalization)}>Сохранить выбор</button>
            </>
          ) : (
            <>
              <button type="button" className="cookie-primary" onClick={() => save(true, true)}>
                <span>Принять cookie</span>
                <small>Разрешить все категории</small>
              </button>
              <button type="button" className="cookie-secondary" onClick={() => save(false, false)}>Только необходимые</button>
              <button type="button" className="cookie-text-button" onClick={openSettings}>Настроить выбор</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
