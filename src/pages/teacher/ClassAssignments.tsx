// src/pages/teacher/ClassAssignments.tsx
// Shows all assignments created for a class — this is where "where do students see it" is answered:
// the assignment appears in this list, scoped to the course it was created for.
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  ArrowLeft, FilePlus, FileText, Clock, Users2, Trash2
} from 'lucide-react';
import { getSession } from '../../utils/auth';
import AvatarCircle from '../../components/AvatarCircle';

interface Assignment {
  id: number; title: string; type: string; courseId: string; courseName: string;
  dueDate: string; dueTime: string; maxPoints: number; instructions: string;
  allowLate: boolean; visible: boolean; fileName: string | null;
  created: string; createdBy: string;
}

export default function ClassAssignments() {
  const navigate = useNavigate();
  const { id }   = useParams(); // course id
  const user     = getSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courseName,  setCourseName]  = useState('');

  useEffect(() => {
    const all: Assignment[] = JSON.parse(localStorage.getItem('edustruc_assignments') || '[]');
    const filtered = all.filter(a => a.courseId === id);
    setAssignments(filtered);
    if (filtered.length > 0) setCourseName(filtered[0].courseName);
  }, [id]);

  const handleDelete = (assignId: number) => {
    const all: Assignment[] = JSON.parse(localStorage.getItem('edustruc_assignments') || '[]');
    const updated = all.filter(a => a.id !== assignId);
    localStorage.setItem('edustruc_assignments', JSON.stringify(updated));
    setAssignments(prev => prev.filter(a => a.id !== assignId));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate(`/teacher/classes/${id}`)}>Class</span>
          <span style={{ color: '#C6C6CD' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>Assignments</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name}</p>
          <AvatarCircle size={36} />
        </div>
      </header>

      <main style={{ padding: '28px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate(`/teacher/classes/${id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', marginBottom: '20px', padding: 0 }}>
          <ArrowLeft size={15} /> Back to Class
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: '0 0 4px' }}>
              Assignments {courseName && `— ${courseName}`}
            </h1>
            <p style={{ fontSize: '13px', color: '#76777D', margin: 0 }}>
              Assignments created here are visible to students enrolled in this course, sorted by due date.
            </p>
          </div>
          <button onClick={() => navigate('/teacher/create-assignment')}
            style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilePlus size={14} /> New Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
            <FileText size={36} color="#C6C6CD" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: '#45464D', margin: '0 0 6px' }}>No assignments yet</p>
            <p style={{ fontSize: '13px', color: '#76777D', margin: '0 0 16px' }}>Create your first assignment for this class.</p>
            <button onClick={() => navigate('/teacher/create-assignment')}
              style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', cursor: 'pointer' }}>
              + Create Assignment
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignments.map(a => (
              <div key={a.id} style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: '#EFF4FF', color: '#0051D5', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>{a.type}</span>
                    {!a.visible && <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>HIDDEN</span>}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 4px' }}>{a.title}</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#76777D', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> Due {a.dueDate} {a.dueTime}</span>
                    <span style={{ fontSize: '12px', color: '#76777D' }}>{a.maxPoints} pts</span>
                    {a.allowLate && <span style={{ fontSize: '12px', color: '#059669' }}>Late OK</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}