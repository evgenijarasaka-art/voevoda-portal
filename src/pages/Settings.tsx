import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'security' | 'appearance';
type Theme = 'light' | 'dark' | 'auto';
type Lang = 'ru' | 'en';

interface NotifSettings {
  newMessage: boolean; newSubscriber: boolean; courseUpdate: boolean;
  communityPost: boolean; promoEmail: boolean; weeklyDigest: boolean;
  systemAlerts: boolean; paymentNotif: boolean;
}

interface PrivacySettings {
  profilePublic: boolean; showOnline: boolean; showBirthday: boolean;
  showCity: boolean; allowMessages: boolean; showCourses: boolean;
}

interface Session {
  device: string; location: string; time: string; current: boolean;
}

const ANIM = `
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.s-fade{animation:fadeUp .25s ease both}
.s-toast{animation:fadeIn .2s ease}
.s-trow:hover{background:var(--s-hover)!important}
.s-nav:hover:not(.s-nav-active){background:var(--s-hover)!important}
`;

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{ width: 42, height: 23, borderRadius: 12, background: on ? '#375DFB' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 2, left: on ? 21 : 2, width: 19, height: 19, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
    </div>
  );
}

function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'amber' }) {
  const colors = {
    blue: { bg: '#EBF1FF', text: '#375DFB' },
    green: { bg: '#F0FDF4', text: '#059669' },
    amber: { bg: '#FFFBEB', text: '#B45309' },
  };
  const c = colors[color];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text }}>
      {children}
    </span>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SettingsTab>('account');
  const [saved, setSaved] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');
  const [lang, setLang] = useState<Lang>('ru');
  const [density, setDensity] = useState(2);
  const [fontSize, setFontSize] = useState(14);
  const [twoFA, setTwoFA] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [sessions, setSessions] = useState<Session[]>([
    { device: 'Chrome · Windows 11', location: 'Санкт-Петербург, RU', time: 'Сейчас', current: true },
    { device: 'Safari · iPhone 15', location: 'Москва, RU', time: '2 часа назад', current: false },
    { device: 'Firefox · Ubuntu', location: 'Санкт-Петербург, RU', time: 'Вчера', current: false },
  ]);
  const [notif, setNotif] = useState<NotifSettings>({
    newMessage: true, newSubscriber: true, courseUpdate: true,
    communityPost: false, promoEmail: false, weeklyDigest: true,
    systemAlerts: true, paymentNotif: true,
  });
  const [priv, setPriv] = useState<PrivacySettings>({
    profilePublic: true, showOnline: true, showBirthday: false,
    showCity: true, allowMessages: true, showCourses: true,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') { root.classList.remove('dark'); root.setAttribute('data-theme', 'light'); }
    else if (theme === 'dark') { root.classList.add('dark'); root.setAttribute('data-theme', 'dark'); }
    else { root.removeAttribute('data-theme'); root.classList.remove('dark'); }
  }, [theme]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const isDark = theme === 'dark';
  const cs = {
    bg: isDark ? '#0f1117' : '#F8F9FB',
    card: isDark ? '#1a1d26' : '#fff',
    border: isDark ? '#2d3148' : '#E5E7EB',
    text: isDark ? '#e4e6eb' : '#111',
    muted: isDark ? '#6b7280' : '#9CA3AF',
    subBg: isDark ? '#111420' : '#F9FAFB',
    hover: isDark ? '#1f2330' : '#f3f4f6',
    inputBg: isDark ? '#1f2330' : '#F9FAFB',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 13px', border: `1px solid ${cs.border}`,
    borderRadius: 9, fontSize: 13, outline: 'none', background: cs.inputBg,
    color: cs.text, boxSizing: 'border-box', transition: 'border-color .15s',
  };

  const cardStyle: React.CSSProperties = {
    background: cs.card, border: `1px solid ${cs.border}`, borderRadius: 16,
  };

  const secBlockStyle: React.CSSProperties = {
    background: cs.subBg, border: `1px solid ${cs.border}`,
    borderRadius: 13, padding: 18, marginBottom: 14,
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: cs.muted, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 }}>
      {children}
    </div>
  );

  const ToggleRow = ({ label, sub, val, onChange }: { label: string; sub?: string; val: boolean; onChange: () => void }) => (
    <div className="s-trow" onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, cursor: 'pointer', transition: 'background .15s' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: cs.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: cs.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle on={val} onChange={onChange} />
    </div>
  );

  const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${cs.border}` }}>
      <span style={{ fontSize: 13, color: cs.muted }}>{label}</span>
      <span style={{ fontSize: 13, color: cs.text }}>{children}</span>
    </div>
  );

  const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'account',       label: 'Аккаунт',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { key: 'privacy',       label: 'Приватность',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { key: 'notifications', label: 'Уведомления',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { key: 'security',      label: 'Безопасность',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { key: 'appearance',    label: 'Оформление',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ];

  const primaryBtn: React.CSSProperties = {
    padding: '11px 28px', background: '#375DFB', border: 'none', borderRadius: 11,
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  };

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: cs.bg, transition: 'background .25s' }}>
      <style>{ANIM}</style>
      <div style={{ padding: '24px 24px 40px', maxWidth: 1000, margin: '0 auto' }}>

        <div className="s-fade" style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: cs.text, margin: '0 0 4px' }}>Настройки</h1>
          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: cs.muted, alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Главная</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cs.border} strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color: cs.text, fontWeight: 500 }}>Настройки</span>
          </div>
        </div>

        {saved && (
          <div className="s-toast" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Настройки успешно сохранены</span>
          </div>
        )}

        <div className="s-fade" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>

          {/* Sidebar */}
          <div style={{ ...cardStyle, padding: '6px 0' }}>
            {TABS.map(t => (
              <button key={t.key} className={`s-nav${tab === t.key ? ' s-nav-active' : ''}`}
                onClick={() => setTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: tab === t.key ? '#EBF1FF' : 'transparent', color: tab === t.key ? '#375DFB' : cs.muted, borderLeft: `3px solid ${tab === t.key ? '#375DFB' : 'transparent'}`, cursor: 'pointer', fontSize: 13, fontWeight: tab === t.key ? 600 : 400, textAlign: 'left', transition: 'all .15s' }}>
                <span style={{ color: tab === t.key ? '#375DFB' : cs.muted, flexShrink: 0 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
            <div style={{ height: 1, background: cs.border, margin: '6px 10px' }} />
            <button onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', color: '#EF4444', borderLeft: '3px solid transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Выйти
            </button>
          </div>

          {/* Content */}
          <div style={{ ...cardStyle, padding: 22 }}>

            {/* ACCOUNT */}
            {tab === 'account' && (
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: cs.text, marginBottom: 18 }}>Аккаунт</div>

                <div style={{ ...secBlockStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: `2px solid ${cs.border}` }}>
                    <img src="/teacher2-main.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: cs.text, marginBottom: 3 }}>Торнадо</div>
                    <div style={{ fontSize: 13, color: cs.muted, marginBottom: 8 }}>tornado@voevoda.ru</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Badge color="blue">КМБ-3</Badge>
                      <Badge color="green">Pro</Badge>
                    </div>
                  </div>
                  <button onClick={() => navigate('/profile/edit')}
                    style={{ padding: '9px 18px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer', flexShrink: 0 }}>
                    Редактировать
                  </button>
                </div>

                <SectionTitle>Данные аккаунта</SectionTitle>
                <div style={{ ...secBlockStyle, padding: '0 14px' }}>
                  <InfoRow label="Тариф"><Badge color="blue">Pro · активен</Badge></InfoRow>
                  <InfoRow label="Зарегистрирован">12 января 2023</InfoRow>
                  <InfoRow label="Последний вход">Сегодня, 09:41</InfoRow>
                  <InfoRow label="Роль"><Badge color="amber">Инструктор</Badge></InfoRow>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0' }}>
                    <span style={{ fontSize: 13, color: cs.muted }}>ID аккаунта</span>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: cs.muted }}>#vvd-08421</span>
                  </div>
                </div>

                <SectionTitle>Подписка</SectionTitle>
                <div style={{ ...secBlockStyle, padding: '0 14px' }}>
                  <InfoRow label="Следующее списание">15 мая 2026</InfoRow>
                  <InfoRow label="Сумма">990 ₽/мес</InfoRow>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0' }}>
                    <span style={{ fontSize: 13, color: cs.muted }}>Способ оплаты</span>
                    <span style={{ fontSize: 13, color: cs.text }}>•••• 4872</span>
                  </div>
                </div>
                <button style={primaryBtn} onClick={() => navigate('/billing')}>Управление подпиской</button>
              </div>
            )}

            {/* PRIVACY */}
            {tab === 'privacy' && (
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: cs.text, marginBottom: 18 }}>Приватность</div>
                <SectionTitle>Видимость профиля</SectionTitle>
                <div style={{ background: cs.subBg, borderRadius: 11, overflow: 'hidden', marginBottom: 16 }}>
                  <ToggleRow label="Публичный профиль" sub="Все пользователи видят ваш профиль" val={priv.profilePublic} onChange={() => setPriv(p => ({ ...p, profilePublic: !p.profilePublic }))} />
                  <ToggleRow label="Статус «онлайн»" sub="Показывать активность в реальном времени" val={priv.showOnline} onChange={() => setPriv(p => ({ ...p, showOnline: !p.showOnline }))} />
                  <ToggleRow label="Дата рождения" val={priv.showBirthday} onChange={() => setPriv(p => ({ ...p, showBirthday: !p.showBirthday }))} />
                  <ToggleRow label="Город" val={priv.showCity} onChange={() => setPriv(p => ({ ...p, showCity: !p.showCity }))} />
                  <ToggleRow label="Пройденные курсы" val={priv.showCourses} onChange={() => setPriv(p => ({ ...p, showCourses: !p.showCourses }))} />
                </div>
                <SectionTitle>Сообщения</SectionTitle>
                <div style={{ background: cs.subBg, borderRadius: 11, overflow: 'hidden', marginBottom: 18 }}>
                  <ToggleRow label="Личные сообщения" sub="Только подписчики смогут писать вам" val={priv.allowMessages} onChange={() => setPriv(p => ({ ...p, allowMessages: !p.allowMessages }))} />
                </div>
                <button style={primaryBtn} onClick={handleSave}>Сохранить</button>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {tab === 'notifications' && (
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: cs.text, marginBottom: 18 }}>Уведомления</div>
                <SectionTitle>Активность</SectionTitle>
                <div style={{ background: cs.subBg, borderRadius: 11, overflow: 'hidden', marginBottom: 16 }}>
                  <ToggleRow label="Новое сообщение" sub="Входящие диалоги и ответы" val={notif.newMessage} onChange={() => setNotif(p => ({ ...p, newMessage: !p.newMessage }))} />
                  <ToggleRow label="Новый подписчик" val={notif.newSubscriber} onChange={() => setNotif(p => ({ ...p, newSubscriber: !p.newSubscriber }))} />
                  <ToggleRow label="Обновление курса" sub="Новые уроки, тесты, домашние задания" val={notif.courseUpdate} onChange={() => setNotif(p => ({ ...p, courseUpdate: !p.courseUpdate }))} />
                  <ToggleRow label="Посты в сообществах" val={notif.communityPost} onChange={() => setNotif(p => ({ ...p, communityPost: !p.communityPost }))} />
                </div>
                <SectionTitle>Почтовые рассылки</SectionTitle>
                <div style={{ background: cs.subBg, borderRadius: 11, overflow: 'hidden', marginBottom: 18 }}>
                  <ToggleRow label="Платёжные уведомления" sub="Чеки и статусы заказов" val={notif.paymentNotif} onChange={() => setNotif(p => ({ ...p, paymentNotif: !p.paymentNotif }))} />
                  <ToggleRow label="Системные оповещения" sub="Плановые работы, обновления платформы" val={notif.systemAlerts} onChange={() => setNotif(p => ({ ...p, systemAlerts: !p.systemAlerts }))} />
                  <ToggleRow label="Еженедельный дайджест" val={notif.weeklyDigest} onChange={() => setNotif(p => ({ ...p, weeklyDigest: !p.weeklyDigest }))} />
                  <ToggleRow label="Акции и предложения" val={notif.promoEmail} onChange={() => setNotif(p => ({ ...p, promoEmail: !p.promoEmail }))} />
                </div>
                <button style={primaryBtn} onClick={handleSave}>Сохранить</button>
              </div>
            )}

            {/* SECURITY */}
            {tab === 'security' && (
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: cs.text, marginBottom: 18 }}>Безопасность</div>

                <div style={secBlockStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPassModal ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: cs.text, marginBottom: 3 }}>Пароль</div>
                      <div style={{ fontSize: 12, color: cs.muted }}>Последнее изменение: 3 месяца назад</div>
                    </div>
                    <button onClick={() => setShowPassModal(p => !p)}
                      style={{ padding: '7px 14px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 9, fontSize: 12, fontWeight: 600, color: '#375DFB', cursor: 'pointer' }}>
                      {showPassModal ? 'Отмена' : 'Изменить'}
                    </button>
                  </div>
                  {showPassModal && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {(['Текущий пароль', 'Новый пароль', 'Подтверждение'] as const).map(label => (
                        <div key={label}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: cs.muted, marginBottom: 4 }}>{label}</label>
                          <input type="password" style={inputStyle} placeholder="••••••••"
                            onFocus={e => (e.target.style.borderColor = '#375DFB')}
                            onBlur={e => (e.target.style.borderColor = cs.border)} />
                        </div>
                      ))}
                      <button style={primaryBtn} onClick={() => { setShowPassModal(false); handleSave(); }}>Сохранить пароль</button>
                    </div>
                  )}
                </div>

                <div style={secBlockStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: cs.text, marginBottom: 3 }}>Двухфакторная аутентификация</div>
                      <div style={{ fontSize: 12, color: cs.muted }}>{twoFA ? 'Включена — аккаунт защищён' : 'Рекомендуем включить для защиты'}</div>
                    </div>
                    <Toggle on={twoFA} onChange={() => setTwoFA(p => !p)} />
                  </div>
                  {twoFA && (
                    <div style={{ marginTop: 12, padding: '10px 13px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 9, fontSize: 12, color: '#059669' }}>
                      ✓ 2FA активирована через приложение-аутентификатор
                    </div>
                  )}
                </div>

                <div style={secBlockStyle}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: cs.text, marginBottom: 12 }}>Активные сессии</div>
                  {sessions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < sessions.length - 1 ? `1px solid ${cs.border}` : 'none' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: cs.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {s.device}
                          {s.current && <Badge color="green">текущая</Badge>}
                        </div>
                        <div style={{ fontSize: 12, color: cs.muted, marginTop: 2 }}>{s.location} · {s.time}</div>
                      </div>
                      {!s.current && (
                        <button onClick={() => setSessions(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #FECACA', borderRadius: 7, fontSize: 12, color: '#EF4444', cursor: 'pointer' }}>
                          Завершить
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 13, padding: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 5 }}>Опасная зона</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Удаление необратимо. Все данные будут уничтожены.</div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Введите «УДАЛИТЬ» для подтверждения</label>
                  <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="УДАЛИТЬ"
                    style={{ ...inputStyle, background: '#fff', borderColor: '#FECACA', marginBottom: 10 }}
                    onFocus={e => (e.target.style.borderColor = '#EF4444')}
                    onBlur={e => (e.target.style.borderColor = '#FECACA')} />
                  <button disabled={deleteConfirm !== 'УДАЛИТЬ'}
                    style={{ padding: '9px 22px', background: deleteConfirm === 'УДАЛИТЬ' ? '#EF4444' : '#F9FAFB', border: `1px solid ${deleteConfirm === 'УДАЛИТЬ' ? '#EF4444' : '#E5E7EB'}`, borderRadius: 9, color: deleteConfirm === 'УДАЛИТЬ' ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: deleteConfirm === 'УДАЛИТЬ' ? 'pointer' : 'default' }}>
                    Удалить аккаунт
                  </button>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {tab === 'appearance' && (
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: cs.text, marginBottom: 18 }}>Оформление</div>

                <SectionTitle>Тема интерфейса</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
                  {([
                    { val: 'light' as Theme, label: 'Светлая', preview: '#ffffff' },
                    { val: 'dark' as Theme,  label: 'Тёмная',  preview: '#0f1117' },
                    { val: 'auto' as Theme,  label: 'Авто',    preview: 'linear-gradient(135deg,#fff 50%,#0f1117 50%)' },
                  ]).map(t => (
                    <button key={t.val} onClick={() => setThemeState(t.val)}
                      style={{ padding: 14, border: `2px solid ${theme === t.val ? '#375DFB' : cs.border}`, borderRadius: 13, background: cs.card, cursor: 'pointer', transition: 'all .15s', textAlign: 'center' }}>
                      <div style={{ width: '100%', height: 38, borderRadius: 8, border: `1px solid ${cs.border}`, background: t.preview, marginBottom: 8 }} />
                      <div style={{ fontSize: 13, fontWeight: theme === t.val ? 600 : 400, color: theme === t.val ? '#375DFB' : cs.muted }}>{t.label}</div>
                    </button>
                  ))}
                </div>

                <SectionTitle>Язык интерфейса</SectionTitle>
                <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                  {([['ru', 'Русский'], ['en', 'English']] as [Lang, string][]).map(([val, lbl]) => (
                    <button key={val} onClick={() => setLang(val)}
                      style={{ padding: '9px 18px', border: `2px solid ${lang === val ? '#375DFB' : cs.border}`, borderRadius: 11, background: lang === val ? '#EBF1FF' : cs.subBg, fontSize: 13, fontWeight: lang === val ? 600 : 400, color: lang === val ? '#375DFB' : cs.text, cursor: 'pointer', transition: 'all .15s' }}>
                      {lbl}
                    </button>
                  ))}
                </div>

                <SectionTitle>Плотность интерфейса</SectionTitle>
                <div style={{ ...secBlockStyle, marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: cs.muted, marginBottom: 10 }}>
                    <span>Компактный</span>
                    <span style={{ fontWeight: 600, color: cs.text }}>{density}</span>
                    <span>Просторный</span>
                  </div>
                  <input type="range" min={1} max={3} step={1} value={density}
                    onChange={e => setDensity(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#375DFB' }} />
                </div>

                <SectionTitle>Размер шрифта</SectionTitle>
                <div style={{ ...secBlockStyle, marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: cs.muted, marginBottom: 10 }}>
                    <span style={{ fontSize: 12 }}>A</span>
                    <span style={{ fontWeight: 600, color: cs.text }}>{fontSize}px</span>
                    <span style={{ fontSize: 17 }}>A</span>
                  </div>
                  <input type="range" min={12} max={18} step={1} value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#375DFB' }} />
                </div>

                <button style={primaryBtn} onClick={handleSave}>Сохранить</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
