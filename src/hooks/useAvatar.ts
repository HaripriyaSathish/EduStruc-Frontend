// src/hooks/useAvatar.ts
import { useState, useEffect } from 'react';

export function useAvatar(): string {
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('edustruc_avatar') || '';
  });

  useEffect(() => {
    // Reload on window focus (user navigated back from settings)
    const onFocus = () => {
      const saved = localStorage.getItem('edustruc_avatar');
      setAvatarUrl(saved || '');
    };

    // Cross-tab storage events
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'edustruc_avatar') {
        setAvatarUrl(e.newValue || '');
      }
    };

    // Custom event fired by settings page on same tab
    const onAvatarChange = (e: CustomEvent) => {
      setAvatarUrl(e.detail || '');
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    window.addEventListener('avatarChanged', onAvatarChange as EventListener);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('avatarChanged', onAvatarChange as EventListener);
    };
  }, []);

  return avatarUrl;
}

// Call this whenever avatar is updated (in settings page)
export function broadcastAvatarChange(url: string) {
  localStorage.setItem('edustruc_avatar', url);
  window.dispatchEvent(new CustomEvent('avatarChanged', { detail: url }));
}