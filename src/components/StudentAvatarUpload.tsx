// src/components/StudentAvatarUpload.tsx
// Drop-in avatar upload widget for Create/Edit Student pages

import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { apiFetch } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL;// update to your LAN IP

interface Props {
  studentId:      number;
  currentAvatar?: string | null;
  studentName:    string;
  onUploadDone:   (newUrl: string) => void;
}

const nameToColor = (name: string) => {
  const colors = [
    { bg: '#DCE9FF', color: '#0051D5' },
    { bg: '#DCFCE7', color: '#166534' },
    { bg: '#F3E8FF', color: '#7C3AED' },
    { bg: '#FEE2E2', color: '#991B1B' },
    { bg: '#D1FAE5', color: '#059669' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function StudentAvatarUpload({ studentId, currentAvatar, studentName, onUploadDone }: Props) {
  const [preview,   setPreview]   = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { bg, color } = nameToColor(studentName);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)     { setError('Image must be under 5MB.'); return; }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Django
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiFetch(`${API_BASE}/api/students/${studentId}/avatar/`, {
        method: 'PATCH',
        body:   formData,
        // Don't set Content-Type — let browser set multipart boundary automatically
      });
      if (res.ok) {
        const data = await res.json();
        onUploadDone(data.avatar_url);
      } else {
        setError('Upload failed. Please try again.');
        setPreview(currentAvatar || null);
      }
    } catch { setError('Cannot connect to server.'); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* Avatar circle with camera overlay on hover */}
      <div
        style={{ position: 'relative', width: '80px', height: '80px', cursor: 'pointer' }}
        onClick={() => fileRef.current?.click()}>

        {/* Avatar */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #DCE9FF', background: preview ? 'transparent' : bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {preview ? (
            <img src={preview} alt={studentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '28px', fontWeight: 700, color }}>{studentName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Camera overlay */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploading ? 1 : 0, transition: 'opacity 0.2s ease' }}
          onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
          onMouseLeave={e => { if (!uploading) (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}>
          {uploading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ) : (
            <Camera size={20} color="#fff" />
          )}
        </div>

        {/* Remove button */}
        {preview && !uploading && (
          <button
            onClick={e => { e.stopPropagation(); setPreview(null); onUploadDone(''); }}
            style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: '#DC2626', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={10} color="#fff" />
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

      <p style={{ fontSize: '12px', color: '#76777D', margin: 0, textAlign: 'center' }}>
        {uploading ? 'Uploading...' : 'Click to upload photo'}
      </p>
      {error && <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>{error}</p>}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}