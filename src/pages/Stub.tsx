import { useNavigate } from 'react-router-dom';

interface StubProps { title: string; }

function buildItems(title: string) {
  if (title.toLowerCase().includes('лидер')) {
    return ['Торнадо: ИВ 2463, рейтинг 5.0', 'Бек: ИВ 1842, инструктор месяца', 'Резак: 12 закрытых занятий'];
  }
  if (title.toLowerCase().includes('город')) {
    return ['Москва: 8 учебных площадок', 'Краснодар: 4 активные группы', 'Казань: ближайший старт 23 мая'];
  }
  if (title.toLowerCase().includes('соревн')) {
    return ['Тактический марш: регистрация открыта', 'Огневой рубеж: 42 участника', 'Медицина: командный зачёт'];
  }
  if (title.toLowerCase().includes('журнал')) {
    return ['Новая запись сохранена в ленте', '3 материала доступны для чтения', 'Черновики можно открыть из журнала'];
  }
  return ['Лента обновлений готова', 'Друзья и сообщества отображаются в общем потоке', 'Можно перейти к сообщениям или курсам'];
}

export function Stub({ title }: StubProps) {
  const navigate = useNavigate();
  const items = buildItems(title);

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F4F6FB' }}>
      <div style={{ padding: '28px 32px 48px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 18, padding: '28px 30px', marginBottom: 18, boxShadow: '0 12px 32px rgba(17,24,39,.06)' }}>
          <div style={{ fontSize: 13, color: '#375DFB', fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Демо-раздел портала</div>
          <h1 style={{ margin: '0 0 10px', fontSize: 32, fontWeight: 950, color: '#111827' }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: 720, color: '#6B7280', fontSize: 15, lineHeight: 1.7 }}>
            Раздел показывает рабочий пример интерфейса: данные, карточки и действия уже доступны для проверки.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 18 }}>
          {items.map((item, index) => (
            <div key={item} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EBF1FF', color: '#375DFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginBottom: 14 }}>{index + 1}</div>
              <div style={{ fontSize: 15, color: '#111827', fontWeight: 800, lineHeight: 1.5 }}>{item}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#0E1424', borderRadius: 18, padding: '24px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Действия доступны</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.64)' }}>Можно вернуться к курсам, открыть журнал или написать в сообщения.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => navigate('/courses')} style={{ padding: '11px 18px', border: 'none', borderRadius: 10, background: '#375DFB', color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>К курсам</button>
            <button type="button" onClick={() => navigate('/journal')} style={{ padding: '11px 18px', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Журнал</button>
            <button type="button" onClick={() => navigate('/messages?chat=4')} style={{ padding: '11px 18px', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Сообщения</button>
          </div>
        </div>
      </div>
    </div>
  );
}

