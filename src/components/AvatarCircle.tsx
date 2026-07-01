// src/components/AvatarCircle.tsx
// Drop-in avatar circle for any page header — reads from localStorage automatically

import { useState, useEffect } from 'react';
import { getSession } from '../utils/auth';

interface Props {
  size?: number;
}

export default function AvatarCircle({ size = 36 }: Props) {
  const user = getSession();
  const [avatarUrl, setAvatarUrl] = useState<string>(() =>
    localStorage.getItem('edustruc_avatar') || ''
  );

  useEffect(() => {
    const refresh = () => {
      const saved = localStorage.getItem('edustruc_avatar');
      setAvatarUrl(saved || '');
    };

    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('avatarChanged', refresh);

    // Also poll every 2 seconds in case event missed
    const interval = setInterval(refresh, 2000);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('avatarChanged', refresh);
      clearInterval(interval);
    };
  }, []);

  const initial = (user?.full_name || 'T').charAt(0).toUpperCase();

  return (
    <div style={{
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%', background: '#0051D5',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid #DCE9FF',
    }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setAvatarUrl('')}
        />
      ) : (
        <span style={{ color: '#fff', fontWeight: 700, fontSize: `${Math.round(size * 0.39)}px` }}>
          {initial}
        </span>
      )}
    </div>
  );
}