import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserSettings } from '../store/useUserSettingsStore';

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'security';

const ANIM = `
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.s-fade{animation:fadeUp .25s ease both}
.s-toast{animation:fadeIn .2s ease}
.s-trow:hover{background:#f3f4f6!important}
.s-nav:hover:not(.s-nav-active){background:#f3f4f6!important}
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

const ROLE_LABELS: Record<string, string> = {
  super: 'Суперадмин', admin: 'Администратор', instructor: 'Инструктор', user: 'Участник',
};

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('account');
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Приватность/уведомления/безопасность — персистентный стор.
  const { notif, priv, twoFA, sessions, setNotif, setPriv, setTwoFA, endSession, endAllSessions } = useUserSettings();

  const [showPassModal, setShowPassModal] = useState(false);
  const [passCurrent, setPassCurrent] = useState('');
  const [passNew, setPassNew] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const showToast = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3000);
  };
  const handleSave = () => showToast('ok', 'Настройки сохранены');

  // Реальная смена пароля в localStorage-«БД» портала (voevoda_users).
  const changePassword = () => {
    if (!user) return;
    if (!passCurrent || !passNew) { showToast('err', 'Заполните все поля'); return; }
    if (passNew.length < 6) { showToast('err', 'Новый пароль — минимум 6 символов'); return; }
    if (passNew !== passConfirm) { showToast('err', 'Пароли не совпадают'); return; }
    try {
      const users = JSON.parse(localStorage.getItem('voevoda_users') || '{}');
      const key = user.login.toLowerCase();
      if (!users[key]) { showToast('err', 'Аккаунт не найден'); return; }
      if (users[key].password !== passCurrent) { showToast('err', 'Текущий пароль неверный'); return; }
      users[key].password = passNew;
      localStorage.setItem('voevoda_users', JSON.stringify(users));
      setShowPassModal(false);
      setPassCurrent(''); setPassNew(''); setPassConfirm('');
      showToast('ok', 'Пароль изменён');
    } catch {
      showToast('err', 'Не удалось изменить пароль');
    }
  };

  // Реальное удаление аккаунта: убираем из «БД», чистим сессию, разлогиниваем.
  const deleteAccount = () => {
    if (!user || deleteConfirm !== 'УДАЛИТЬ') return;
    try {
      const users = JSON.parse(localStorage.getItem('voevoda_users') || '{}');
      delete users[user.login.toLowerCase()];
      localStorage.setItem('voevoda_users', JSON.stringify(users));
    } catch { /* даже при сбое чтения БД сессию всё равно завершаем */ }
    logout();
    navigate('/login');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const cs = {
    bg: '#F8F9FB', card: '#fff', border: '#E5E7EB', text: '#111',
    muted: '#9CA3AF', subBg: '#F9FAFB', hover: '#f3f4f6', inputBg: '#fff',
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
  ];

  const primaryBtn: React.CSSProperties = {
    padding: '11px 28px', background: '#375DFB', border: 'none', borderRadius: 11,
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  };

  const fullName = user ? `${user.name}${user.surname ? ` ${user.surname}` : ''}` : 'Гость';

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: cs.bg }}>
      <style>{ANIM}</style>
      <div style={{ padding: '32px 32px 56px', maxWidth: 1180, margin: '0 auto' }}>

        <div className="s-fade" style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: cs.text, margin: '0 0 4px' }}>Настройки</h1>
        </div>

        {toast && (
          <div className="s-toast" style={{
            background: toast.kind === 'ok' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${toast.kind === 'ok' ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: 12, padding: '12px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {toast.kind === 'ok'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            <span style={{ fontSize: 13, fontWeight: 600, color: toast.kind === 'ok' ? '#059669' : '#DC2626' }}>{toast.text}</span>
          </div>
        )}

        <div className="s-fade" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 22, alignItems: 'start' }}>

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
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', color: '#EF4444', borderLeft: '3px solid transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Выйти
            </button>
          </div>

          {/* Content */}
          <div style={{ ...cardStyle, padding: 30 }}>

            {/* ACCOUNT */}
            {tab === 'account' && (
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: cs.text, marginBottom: 18 }}>Аккаунт</div>

                <div style={{ ...secBlockStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: `2px solid ${cs.border}` }}>
                    <img src="/teacher2-main.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: cs.text, marginBottom: 3 }}>{user?.callsign || fullName}</div>
                    <div style={{ fontSize: 13, color: cs.muted, marginBottom: 8 }}>{user?.email || '—'}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Badge color="blue">{fullName}</Badge>
                      {user?.role && <Badge color="amber">{ROLE_LABELS[user.role] || user.role}</Badge>}
                    </div>
                  </div>
                  <button onClick={() => navigate('/profile/edit')}
                    style={{ padding: '9px 18px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer', flexShrink: 0 }}>
                    Редактировать
                  </button>
                </div>

                <SectionTitle>Данные аккаунта</SectionTitle>
                <div style={{ ...secBlockStyle, padding: '0 14px' }}>
                  <InfoRow label="Логин">{user?.login || '—'}</InfoRow>
                  <InfoRow label="Телефон">{user?.phone || '—'}</InfoRow>
                  <InfoRow label="Почта">{user?.email || '—'}</InfoRow>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0' }}>
                    <span style={{ fontSize: 13, color: cs.muted }}>Роль</span>
                    <Badge color="amber">{user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Участник'}</Badge>
                  </div>
                </div>

                <SectionTitle>Платежи и подписка</SectionTitle>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button style={primaryBtn} onClick={() => navigate('/billing')}>Управление подпиской</button>
                  <button onClick={() => navigate('/wallet')}
                    style={{ padding: '11px 28px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 11, color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Кошелёк и платежи
                  </button>
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {tab === 'privacy' && (
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: cs.text, marginBottom: 18 }}>Приватность</div>
                <SectionTitle>Видимость профиля</SectionTitle>
                <div style={{ background: cs.subBg, borderRadius: 11, overflow: 'hidden', marginBottom: 16 }}>
                  <ToggleRow label="Публичный профиль" sub="Все пользователи видят ваш профиль" val={priv.profilePublic} onChange={() => setPriv({ profilePublic: !priv.profilePublic })} />
                  <ToggleRow label="Статус «онлайн»" sub="Показывать активность в реальном времени" val={priv.showOnline} onChange={() => setPriv({ showOnline: !priv.showOnline })} />
                  <ToggleRow label="Дата рождения" val={priv.showBirthday} onChange={() => setPriv({ showBirthday: !priv.showBirthday })} />
                  <ToggleRow label="Город" val={priv.showCity} onChange={() => setPriv({ showCity: !priv.showCity })} />
                  <ToggleRow label="Пройденные курсы" val={priv.showCourses} onChange={() => setPriv({ showCourses: !priv.showCourses })} />
                </div>
                <SectionTitle>Сообщения</SectionTitle>
                <div style={{ background: cs.subBg, borderRadius: 11, overflow: 'hidden', marginBottom: 18 }}>
                  <ToggleRow label="Личные сообщения" sub="Только подписчики смогут писать вам" val={priv.allowMessages} onChange={() => setPriv({ allowMessages: !priv.allowMessages })} />
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
                  <ToggleRow label="Новое сообщение" sub="Входящие диалоги и ответы" val={notif.newMessage} onChange={() => setNotif({ newMessage: !notif.newMessage })} />
                  <ToggleRow label="Новый подписчик" val={notif.newSubscriber} onChange={() => setNotif({ newSubscriber: !notif.newSubscriber })} />
                  <ToggleRow label="Обновление курса" sub="Новые уроки, тесты, домашние задания" val={notif.courseUpdate} onChange={() => setNotif({ courseUpdate: !notif.courseUpdate })} />
                  <ToggleRow label="Посты в сообществах" val={notif.communityPost} onChange={() => setNotif({ communityPost: !notif.communityPost })} />
                </div>
                <SectionTitle>Почтовые рассылки</SectionTitle>
                <div style={{ background: cs.subBg, borderRadius: 11, overflow: 'hidden', marginBottom: 18 }}>
                  <ToggleRow label="Платёжные уведомления" sub="Чеки и статусы заказов" val={notif.paymentNotif} onChange={() => setNotif({ paymentNotif: !notif.paymentNotif })} />
                  <ToggleRow label="Системные оповещения" sub="Плановые работы, обновления платформы" val={notif.systemAlerts} onChange={() => setNotif({ systemAlerts: !notif.systemAlerts })} />
                  <ToggleRow label="Еженедельный дайджест" val={notif.weeklyDigest} onChange={() => setNotif({ weeklyDigest: !notif.weeklyDigest })} />
                  <ToggleRow label="Акции и предложения" val={notif.promoEmail} onChange={() => setNotif({ promoEmail: !notif.promoEmail })} />
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
                      <div style={{ fontSize: 12, color: cs.muted }}>Смена пароля применяется сразу — новый пароль нужен при следующем входе</div>
                    </div>
                    <button onClick={() => setShowPassModal(p => !p)}
                      style={{ padding: '7px 14px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 9, fontSize: 12, fontWeight: 600, color: '#375DFB', cursor: 'pointer' }}>
                      {showPassModal ? 'Отмена' : 'Изменить'}
                    </button>
                  </div>
                  {showPassModal && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {([
                        ['Текущий пароль', passCurrent, setPassCurrent],
                        ['Новый пароль', passNew, setPassNew],
                        ['Подтверждение', passConfirm, setPassConfirm],
                      ] as const).map(([label, value, setter]) => (
                        <div key={label}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: cs.muted, marginBottom: 4 }}>{label}</label>
                          <input type="password" style={inputStyle} placeholder="••••••••" value={value}
                            onChange={e => setter(e.target.value)}
                            onFocus={e => (e.target.style.borderColor = '#375DFB')}
                            onBlur={e => (e.target.style.borderColor = cs.border)} />
                        </div>
                      ))}
                      <button style={primaryBtn} onClick={changePassword}>Сохранить пароль</button>
                    </div>
                  )}
                </div>

                <div style={secBlockStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: cs.text, marginBottom: 3 }}>Двухфакторная аутентификация</div>
                      <div style={{ fontSize: 12, color: cs.muted }}>{twoFA ? 'Включена — аккаунт защищён' : 'Рекомендуем включить для защиты'}</div>
                    </div>
                    <Toggle on={twoFA} onChange={() => setTwoFA(!twoFA)} />
                  </div>
                  {twoFA && (
                    <div style={{ marginTop: 12, padding: '10px 13px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 9, fontSize: 12, color: '#059669' }}>
                      ✓ 2FA активирована через приложение-аутентификатор
                    </div>
                  )}
                </div>

                <div style={secBlockStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: cs.text }}>Активные сессии</div>
                    {sessions.some(s => !s.current) && (
                      <button onClick={() => { endAllSessions(); showToast('ok', 'Все другие сессии завершены'); }}
                        style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #FECACA', borderRadius: 7, fontSize: 12, color: '#EF4444', cursor: 'pointer' }}>
                        Завершить все
                      </button>
                    )}
                  </div>
                  {sessions.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < sessions.length - 1 ? `1px solid ${cs.border}` : 'none' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: cs.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {s.device}
                          {s.current && <Badge color="green">текущая</Badge>}
                        </div>
                        <div style={{ fontSize: 12, color: cs.muted, marginTop: 2 }}>{s.location} · {s.time}</div>
                      </div>
                      {!s.current && (
                        <button onClick={() => { endSession(s.id); showToast('ok', 'Сессия завершена'); }}
                          style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #FECACA', borderRadius: 7, fontSize: 12, color: '#EF4444', cursor: 'pointer' }}>
                          Завершить
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 13, padding: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 5 }}>Опасная зона</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Удаление необратимо: аккаунт исчезнет из портала, сессия завершится.</div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Введите «УДАЛИТЬ» для подтверждения</label>
                  <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="УДАЛИТЬ"
                    style={{ ...inputStyle, background: '#fff', borderColor: '#FECACA', marginBottom: 10 }}
                    onFocus={e => (e.target.style.borderColor = '#EF4444')}
                    onBlur={e => (e.target.style.borderColor = '#FECACA')} />
                  <button disabled={deleteConfirm !== 'УДАЛИТЬ'} onClick={deleteAccount}
                    style={{ padding: '9px 22px', background: deleteConfirm === 'УДАЛИТЬ' ? '#EF4444' : '#F9FAFB', border: `1px solid ${deleteConfirm === 'УДАЛИТЬ' ? '#EF4444' : '#E5E7EB'}`, borderRadius: 9, color: deleteConfirm === 'УДАЛИТЬ' ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: deleteConfirm === 'УДАЛИТЬ' ? 'pointer' : 'default' }}>
                    Удалить аккаунт
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
