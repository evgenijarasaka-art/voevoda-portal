import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';

type FooterLink = { label: string; path: string };
type FooterAction = { label: string; title: string; action: () => void };

const LINK_GROUPS: { title: string; items: FooterLink[] }[] = [
  {
    title: 'Платформа',
    items: [
      { label: 'Курсы', path: '/courses' },
      { label: 'Журнал', path: '/journal' },
      { label: 'Сообщества', path: '/communities' },
      { label: 'Города', path: '/city/Москва' },
    ],
  },
  {
    title: 'Компания',
    items: [
      { label: 'О нас', path: '/company' },
      { label: 'Документы', path: '/documents' },
      { label: 'Реклама', path: '/advertise' },
      { label: 'Поддержка', path: '/faq' },
    ],
  },
  {
    title: 'Правовая информация',
    items: [
      { label: 'Политика конфиденциальности', path: '/privacy' },
      { label: 'Пользовательское соглашение', path: '/terms' },
      { label: 'Платежи', path: '/payments' },
      { label: 'Настройки', path: '/settings' },
    ],
  },
];

function Icon({ type }: { type: 'phone' | 'mail' | 'vk' }) {
  const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'phone') return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.91.32 1.79.6 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.17a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.63.6A2 2 0 0 1 22 16.92Z" /></svg>;
  if (type === 'mail') return <svg {...common}><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="m22 6-10 7L2 6" /></svg>;
  return <svg {...common}><path d="M6 8c.5 5 2.8 8 7.7 8h.3v-3c1.8.2 3.1 1.4 3.6 3H21c-.7-2.1-2.4-3.3-3.4-3.8 1-.7 2.4-2 2.8-4.2h-3.1c-.5 1.7-1.8 3.1-3.3 3.2V8h-3v5.6C9.4 13.2 8.1 11.4 8 8H6Z" /></svg>;
}

export function Footer() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const actions: FooterAction[] = [
    { label: 'Телефон', title: 'Позвонить', action: () => { window.location.href = 'tel:+74951234567'; } },
    { label: 'Почта', title: 'Написать на почту', action: () => { window.location.href = 'mailto:info@voevoda.ru'; } },
    { label: 'ВК', title: 'Открыть ВКонтакте', action: () => window.open('https://vk.com/', '_blank', 'noopener,noreferrer') },
  ];

  const go = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ padding: isMobile ? '22px 16px 28px' : '30px 24px 40px', background: '#F8FAFC' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 18px 48px rgba(15,23,42,.06)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1.85fr',
            gap: isMobile ? 28 : 44,
            padding: isMobile ? '28px 22px' : '40px 44px',
            background: 'linear-gradient(135deg,#FFFFFF 0%,#F5F8FF 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div style={{ width: 68, height: 68, borderRadius: 14, background: '#fff', border: '1px solid #E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                <img src="/footer-logo.png" alt="УТЦ Воевода" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 950, color: '#0F172A', marginBottom: 4 }}>УТЦ «ВОЕВОДА»</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>Учебная платформа и личный кабинет подготовки</div>
              </div>
            </div>

            <p style={{ maxWidth: 430, margin: '0 0 22px', color: '#475569', fontSize: 14, lineHeight: 1.7 }}>
              Курсы, расписание, домашние задания, журнал, достижения и взаимодействие с группой собраны в одном портале.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {actions.map((item) => {
                const active = hovered === item.label;
                const iconType = item.label === 'Телефон' ? 'phone' : item.label === 'Почта' ? 'mail' : 'vk';
                return (
                  <button
                    key={item.label}
                    type="button"
                    title={item.title}
                    onClick={item.action}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      height: 42,
                      padding: '0 14px',
                      borderRadius: 12,
                      border: `1px solid ${active ? '#B8CAFE' : '#E2E8F0'}`,
                      background: active ? '#EEF3FF' : '#fff',
                      color: active ? '#375DFB' : '#334155',
                      fontSize: 13,
                      fontWeight: 850,
                      cursor: 'pointer',
                      transition: 'background .18s, border-color .18s, transform .18s',
                      transform: active ? 'translateY(-2px)' : 'translateY(0)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Icon type={iconType} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: isMobile ? 22 : 28 }}>
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <div style={{ fontSize: 13, fontWeight: 950, color: '#0F172A', marginBottom: 14, textTransform: 'uppercase', letterSpacing: .4 }}>{group.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {group.items.map((item) => {
                    const active = hovered === item.path;
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => go(item.path)}
                        onMouseEnter={() => setHovered(item.path)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          width: 'fit-content',
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          color: active ? '#375DFB' : '#64748B',
                          fontSize: 14,
                          lineHeight: 1.5,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'color .18s, transform .18s',
                          transform: active ? 'translateX(4px)' : 'translateX(0)',
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            padding: isMobile ? '18px 22px' : '18px 44px',
            borderTop: '1px solid #E2E8F0',
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 13, color: '#64748B' }}>© 2015-2026 УТЦ «ВОЕВОДА». Все права защищены.</div>
          <button
            type="button"
            onClick={() => window.open('mailto:hello@arasaka.business', '_blank', 'noopener,noreferrer')}
            style={{ padding: 0, border: 'none', background: 'transparent', color: '#64748B', fontSize: 13, cursor: 'pointer', fontWeight: 750 }}
          >
            Сопровождение сайта: Arasaka Buisness
          </button>
        </div>
      </div>
    </footer>
  );
}
