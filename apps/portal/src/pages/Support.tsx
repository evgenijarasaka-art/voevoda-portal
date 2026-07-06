import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.sup-card{animation:fadeUp .35s ease both}
.sup-card:nth-child(2){animation-delay:.07s}
.sup-card:nth-child(3){animation-delay:.14s}
.sup-channel{transition:box-shadow .2s,transform .2s,border-color .2s}
.sup-channel:hover{box-shadow:0 6px 24px rgba(55,93,251,.13);transform:translateY(-2px);border-color:#C7D2FE!important}
.sup-faq-item{transition:background .15s}
.sup-faq-item:hover{background:#F8FAFF!important}
.sup-input:focus{border-color:#375DFB!important;box-shadow:0 0 0 3px rgba(55,93,251,.08)!important;outline:none}
.sup-textarea:focus{border-color:#375DFB!important;box-shadow:0 0 0 3px rgba(55,93,251,.08)!important;outline:none}
.sup-send-btn{transition:background .15s,transform .1s}
.sup-send-btn:hover{background:#2347e0!important;transform:translateY(-1px)}
.sup-send-btn:active{transform:translateY(0)}
`;

const FAQS = [
  { q: 'Как записаться на курс?', a: 'Выберите интересующий курс в разделе «Курсы», нажмите «Записаться и оплатить» и следуйте инструкциям на экране.' },
  { q: 'Как восстановить доступ к аккаунту?', a: 'На странице входа нажмите «Забыли пароль?» и следуйте инструкциям по восстановлению через SMS.' },
  { q: 'Как получить справку об оплате?', a: 'Перейдите в раздел «Кошелёк» → «История транзакций», выберите платёж и нажмите «Скачать квитанцию».' },
  { q: 'Как связаться с куратором курса?', a: 'В разделе «Мои курсы» откройте нужный курс и воспользуйтесь кнопкой «Написать куратору» в правой панели.' },
  { q: 'Как перенести дату начала курса?', a: 'Напишите в поддержку не позднее чем за 3 дня до старта, мы перенесём запись на ближайший доступный поток.' },
  { q: 'Что входит в тарифный план «Профессионал»?', a: 'Тариф включает неограниченный доступ ко всем курсам, персонального куратора, приоритетную поддержку и сертификат.' },
];

export function Support() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function injectCss() {
    if (document.getElementById('sup-css')) return;
    const s = document.createElement('style'); s.id = 'sup-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  injectCss();

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSent(true);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Назад
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Служба поддержки</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Ответим в течение одного рабочего дня. Среднее время ответа — 2 часа.</p>
      </div>

      {/* Channels */}
      <div className="sup-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 36 }}>
        {[
          { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: 'Написать в чат', sub: 'Пн–Пт, 9:00–21:00', action: () => navigate('/messages') },
          { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z"/></svg>, label: '+7 (495) 000-00-00', sub: 'Пн–Пт, 9:00–18:00', action: () => {} },
          { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'support@voevoda.ru', sub: 'Ответим за 24 часа', action: () => {} },
        ].map((ch, i) => (
          <button
            key={i}
            className="sup-channel"
            onClick={ch.action}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 20px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ch.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{ch.label}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{ch.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* FAQ */}
        <div className="sup-card" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Частые вопросы</div>
          </div>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="sup-faq-item"
              style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #F3F4F6' : 'none' }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '13px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.4 }}>{faq.q}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {open === i && (
                <div style={{ padding: '0 20px 14px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="sup-card" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: '20px 20px 24px' }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #D1FAE5' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Заявка отправлена!</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>Мы получили ваше сообщение и ответим в течение рабочего дня.</div>
              <button onClick={() => setSent(false)} style={{ marginTop: 6, padding: '9px 20px', background: '#F3F4F6', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: '#374151' }}>Отправить ещё</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Написать в поддержку</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Имя <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      className="sup-input"
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="Ваше имя"
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, boxSizing: 'border-box', transition: 'border-color .2s,box-shadow .2s' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Email <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      className="sup-input"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, boxSizing: 'border-box', transition: 'border-color .2s,box-shadow .2s' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Тема обращения</label>
                  <select
                    value={subject} onChange={e => setSubject(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">Выберите тему...</option>
                    <option value="account">Проблемы с аккаунтом</option>
                    <option value="course">Вопросы по курсу</option>
                    <option value="payment">Оплата и возврат</option>
                    <option value="technical">Технические проблемы</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Сообщение <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea
                    className="sup-textarea"
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Опишите вашу проблему или вопрос..."
                    rows={5}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s,box-shadow .2s' }}
                  />
                </div>
                <button
                  className="sup-send-btn"
                  onClick={handleSend}
                  disabled={!name.trim() || !email.trim() || !message.trim()}
                  style={{ padding: '11px', background: !name.trim() || !email.trim() || !message.trim() ? '#D1D5DB' : '#375DFB', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: !name.trim() || !email.trim() || !message.trim() ? 'not-allowed' : 'pointer' }}
                >
                  Отправить обращение
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Working hours */}
      <div className="sup-card" style={{ marginTop: 24, background: '#F8FAFF', border: '1.5px solid #C7D2FE', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 2 }}>Время работы поддержки</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Понедельник — Пятница: 9:00–21:00 МСК &nbsp;·&nbsp; Суббота: 10:00–18:00 МСК &nbsp;·&nbsp; Воскресенье: выходной</div>
        </div>
      </div>
    </div>
  );
}
