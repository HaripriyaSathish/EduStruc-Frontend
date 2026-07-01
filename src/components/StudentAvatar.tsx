// src/components/StudentAvatar.tsx
// Shows student photo if uploaded, falls back to colored initial circle

import { useState } from 'react';

interface Props {
  studentId:  number;
  fullName:   string;
  avatarUrl?: string | null;
  size?:      number;
}

// Generate a consistent color from the student's name
const nameToColor = (name: string): { bg: string; color: string } => {
  const colors = [
    { bg: '#DCE9FF', color: '#0051D5' },
    { bg: '#DCFCE7', color: '#166534' },
    { bg: '#FEF9C3', color: '#854D0E' },
    { bg: '#F3E8FF', color: '#7C3AED' },
    { bg: '#FEE2E2', color: '#991B1B' },
    { bg: '#DBEAFE', color: '#1E40AF' },
    { bg: '#D1FAE5', color: '#059669' },
    { bg: '#FEF3C7', color: '#D97706' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function StudentAvatar({ studentId, fullName, avatarUrl, size = 34 }: Props) {
  const [imgError, setImgError] = useState(false);
  const { bg, color } = nameToColor(fullName);
  const initial = fullName.charAt(0).toUpperCase();
  const showPhoto = avatarUrl && !imgError;

  return (
    <div style={{
      width:        `${size}px`,
      height:       `${size}px`,
      borderRadius: '50%',
      background:   showPhoto ? 'transparent' : bg,
      overflow:     'hidden',
      flexShrink:   0,
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'center',
      border:       `2px solid ${showPhoto ? '#E5E7EB' : bg}`,
    }}>
      {showPhoto ? (
        <img
          src={avatarUrl!}
          alt={fullName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span style={{
          color,
          fontWeight: 700,
          fontSize: `${Math.round(size * 0.39)}px`,
          userSelect: 'none',
        }}>
          {initial}
        </span>
      )}
    </div>
  );
}