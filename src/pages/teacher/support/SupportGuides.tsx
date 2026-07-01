// src/pages/teacher/support/SupportGuides.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { getSession } from '../../../utils/auth';
import AvatarCircle from '../../../components/AvatarCircle';

const ALL_GUIDES = [
  { title: 'Gradebook Configuration',       path: '/teacher/support/gradebook',   category: 'Grading',    time: '5 min read' },
  { title: 'Parent-Teacher Communication',  path: '/teacher/support/parent-comm', category: 'Communication', time: '4 min read' },
  { title: 'Attendance Automation',          path: '/teacher/support/attendance',  category: 'Attendance', time: '6 min read' },
  { title: 'Security & Data Privacy',        path: '/teacher/support/security',   category: 'Security',   time: '7 min read' },
  { title: 'Creating Assignments',           path: '/teacher/support/gradebook',  category: 'Grading',    time: '3 min read' },
  { title: 'Schedule Management',            path: '/teacher/support/attendance', category: 'Scheduling', time: '4 min read' },
  { title: 'Student Roster Import',          path: '/teacher/support/parent-comm',category: 'Students',   time: '5 min read' },
  { title: 'Virtual Classroom Setup',        path: '/teacher/support/security',   category: 'Tools',      time: '8 min read' },
];

export default function SupportGuides() {
  const navigate = useNavigate();
  const user     = getSession();

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/support')}>Support</span>
          <span style={{ color: '#C6C6CD' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>All Guides</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
          <AvatarCircle size={36} />
        </div>
      </header>
      <main style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/teacher/support')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', marginBottom: '24px', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0051D5')}
          onMouseLeave={e => (e.currentTarget.style.color = '#76777D')}>
          <ArrowLeft size={15} /> Back to Support
        </button>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#0B1C30', margin: '0 0 4px' }}>All Guides</h1>
        <p style={{ fontSize: '13px', color: '#76777D', margin: '0 0 24px' }}>Browse all documentation and tutorials for EduStruc SMS.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {ALL_GUIDES.map((g, i) => (
            <div key={i} onClick={() => navigate(g.path)}
              style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#0051D5'; (e.currentTarget as HTMLDivElement).style.background = '#F8FCFF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C6C6CD'; (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#EFF4FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                  <BookOpen size={16} color="#0051D5" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: '0 0 2px' }}>{g.title}</p>
                  <p style={{ fontSize: '11px', color: '#76777D', margin: 0 }}>{g.category} • {g.time}</p>
                </div>
              </div>
              <ChevronRight size={15} color="#C6C6CD" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}