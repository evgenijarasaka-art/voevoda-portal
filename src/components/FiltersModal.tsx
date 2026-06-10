import { useState } from 'react';

const CITIES_ROW1 = ['Москва', 'Санкт-Петербург', 'Уфа', 'Воронеж'];
const CITIES_ROW2 = ['Ростов-на-Дону', 'Краснодар', 'Казань', 'Саратов'];
const CITIES_ROW3 = ['Новгород', 'Саратов', 'Екатеринбург'];
const PLACES = ['Оффлайн', 'Онлайн', 'Комбинированный'];
const COSTS = ['Платные', 'Бесплатные'];
const TYPES_ROW1 = ['Серия курсов', 'Курс', 'Тренинг', 'Интенсив'];
const TYPES_ROW2 = ['Марафон'];

interface Filters { cities: string[]; places: string[]; cost: string[]; types: string[]; }
interface FiltersModalProps { onClose: () => void; onApply?: (f: Filters) => void; }

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' as const, fontSize: 15, color: '#111' }} onClick={onChange}>
      <div style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
        border: checked ? 'none' : '1.5px solid #C9CDD4',
        background: checked ? '#375DFB' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
      }}>
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label}
    </label>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#F0F0F0', margin: '20px 0' }} />;
}

export function FiltersModal({ onClose, onApply }: FiltersModalProps) {
  const [cities, setCities] = useState<string[]>(['Москва', 'Краснодар']);
  const [places, setPlaces] = useState<string[]>(['Оффлайн']);
  const [cost, setCost] = useState<string[]>(['Платные']);
  const [types, setTypes] = useState<string[]>(['Серия курсов']);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const handleReset = () => { setCities([]); setPlaces([]); setCost([]); setTypes([]); };
  const handleApply = () => { onApply?.({ cities, places, cost, types }); onClose(); };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000,
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          width: 520,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          overflow: 'hidden',
        }}
      >
        {/* Заголовок */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px 18px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>Фильтры военной подготовки</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280', borderRadius: 8 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Контент — скроллируемый */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>

          {/* По городам */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>По городам</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[CITIES_ROW1, CITIES_ROW2, CITIES_ROW3].map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 24 }}>
                  {row.map(city => (
                    <Checkbox key={city + ri} checked={cities.includes(city + ri)} onChange={() => toggle(cities, city + ri, setCities)} label={city} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Место проведения */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Место проведения</h3>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {PLACES.map(p => (
                <Checkbox key={p} checked={places.includes(p)} onChange={() => toggle(places, p, setPlaces)} label={p} />
              ))}
            </div>
          </div>

          <Divider />

          {/* Стоимость */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Стоимость</h3>
            <div style={{ display: 'flex', gap: 24 }}>
              {COSTS.map(c => (
                <Checkbox key={c} checked={cost.includes(c)} onChange={() => toggle(cost, c, setCost)} label={c} />
              ))}
            </div>
          </div>

          <Divider />

          {/* Тип */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Тип</h3>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
              {TYPES_ROW1.map(t => (
                <Checkbox key={t} checked={types.includes(t)} onChange={() => toggle(types, t, setTypes)} label={t} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {TYPES_ROW2.map(t => (
                <Checkbox key={t} checked={types.includes(t)} onChange={() => toggle(types, t, setTypes)} label={t} />
              ))}
            </div>
          </div>
        </div>

        {/* Кнопки внизу */}
        <div style={{ display: 'flex', gap: 12, padding: '18px 28px', borderTop: '1px solid #F0F0F0', flexShrink: 0, background: '#fff' }}>
          <button onClick={handleReset}
            style={{ flex: '0 0 140px', padding: '15px 0', background: '#F3F4F6', border: 'none', borderRadius: 12, color: '#6B7280', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>
            Сбросить
          </button>
          <button onClick={handleApply}
            style={{ flex: 1, padding: '15px 0', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1E3F9F')}
            onMouseLeave={e => (e.currentTarget.style.background = '#375DFB')}>
            Показать результат
          </button>
        </div>
      </div>
    </div>
  );
}