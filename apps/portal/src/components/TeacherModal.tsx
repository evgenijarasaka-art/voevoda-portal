import { useState } from 'react';
import { TrainingPanel, MeasurementsPanel } from './IndexCharts';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: {
    name: string;
    rank: string;
    position: string;
    photo: string;
    index: number;
  };
}

export function TeacherModal({ isOpen, onClose, teacher }: TeacherModalProps) {
  const [tab, setTab] = useState('data');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(160deg, #375DFB, #1E3F9F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#FFFFFF'
            }}>
              {teacher.photo}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111111', margin: 0 }}>
                {teacher.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' }}>
                {teacher.rank} · {teacher.position}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#9CA3AF'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #F3F4F6',
          padding: '0 24px'
        }}>
          {[
            { id: 'data', label: 'Данные' },
            { id: 'training', label: 'Подготовка' },
            { id: 'measures', label: 'Замеры' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid #375DFB' : 'none',
                color: tab === t.id ? '#375DFB' : '#6B7280',
                fontWeight: tab === t.id ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {tab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Индекс Воеводы</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#375DFB' }}>{teacher.index}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Специализация</div>
                <div style={{ fontSize: '16px', color: '#111111' }}>{teacher.position}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Курсов проведено</div>
                <div style={{ fontSize: '16px', color: '#111111' }}>24</div>
              </div>
            </div>
          )}
          {tab === 'training' && (
            <TrainingPanel compact />
          )}
          {tab === 'measures' && (
            <MeasurementsPanel compact />
          )}
        </div>
      </div>
    </div>
  );
}