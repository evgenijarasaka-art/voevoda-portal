import { useState } from 'react';

interface TeacherCardProps {
  name: string;
  rank: string;
  position: string;
  photo: string;
  index?: number;
  onClick?: () => void;
}

export function TeacherCard({ name, rank, position, photo, index = 4.2, onClick }: TeacherCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
        boxShadow: hovered 
          ? '0 25px 40px rgba(55,93,251,0.25)' 
          : '0 4px 6px rgba(0,0,0,0.03)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ 
        height: '200px', 
        background: 'linear-gradient(160deg, #375DFB, #1E3F9F)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        color: '#FFFFFF'
      }}>
        {photo}
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '8px' 
        }}>
          <span style={{ 
            background: '#F3F4F6', 
            padding: '2px 8px', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#374151'
          }}>
            {rank}
          </span>
          <span style={{ 
            color: '#375DFB',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            Индекс {index}
          </span>
        </div>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: '#111111',
          marginBottom: '4px'
        }}>
          {name}
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#6B7280'
        }}>
          {position}
        </div>
      </div>
    </div>
  );
}
