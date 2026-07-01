// src/pages/teacher/AllAssignments.tsx
// Shows every assignment across all your classes in one place
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, FileText, Clock, ArrowLeft, Trash2, Search } from 'lucide-react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { getSession } from '../../utils/auth';

interface Assignment {
  id: number; title: string; type: string; courseId: string; courseName: string;
  dueDate: string; dueTime: string; maxPoints: number; instructions: string;
  allowLate: boolean; visible: boolean; fileName: string | null;
  created: string; createdBy: string;
}

export default function AllAssignments() {
  const navigate = useNavigate();
  const user     = getSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    const all: Assignment[] = JSON.parse(localStorage.getItem('edustruc_assignments') || '[]');
    // Newest first
    all.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    setAssignments(all);
  }, []);

  const handleDelete = (assignId: number) => {
    const all: Assignment[] = JSON.parse(localStorage.getItem('edustruc_assignments') || '[]');
    const updated = all.filter(a => a.id !== assignId);
    localStorage.setItem('edustruc_assignments', JSON.stringify(updated));
    setAssignments(prev => prev.filter(a => a.id !== assignId));
  };

  const filtered = assignments.filter(a =>
    !search ||
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.courseName.toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (dueDate: string, dueTime: string) => {
    const due = new Date(`${dueDate}T${dueTime || '23:59'}`);
    return due < new Date();
  };

  const headerRight = (
    <button onClick={() => navigate('/teacher/create-assignment')}
      style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <FilePlus size={14} /> New Assignment
    </button>
  );

  return (
    <TeacherLayout
      title="My Assignments"
      subtitle={`${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} across all your classes`}
      headerRight={headerRight}>

      <main style={{ padding: '24px 28px', flex: 1, maxWidth: '900px' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD' }} />
          <input placeholder="Search assignments by title or class..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #C6C6CD', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
            <FileText size={36} color="#C6C6CD" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: '#45464D', margin: '0 0 6px' }}>
              {assignments.length === 0 ? 'No assignments created yet' : 'No assignments match your search'}
            </p>
            {assignments.length === 0 && (
              <button onClick={() => navigate('/teacher/create-assignment')}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>
                + Create Your First Assignment
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(a => {
              const overdue = isOverdue(a.dueDate, a.dueTime);
              return (
                <div key={a.id} style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/teacher/classes/${a.courseId}/assignments`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: '#EFF4FF', color: '#0051D5', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>{a.type}</span>
                      <span style={{ fontSize: '12px', color: '#76777D' }}>{a.courseName}</span>
                      {!a.visible && <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>HIDDEN</span>}
                      {overdue && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>OVERDUE</span>}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 4px' }}>{a.title}</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#76777D', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> Due {a.dueDate} {a.dueTime}</span>
                      <span style={{ fontSize: '12px', color: '#76777D' }}>{a.maxPoints} pts</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </TeacherLayout>
  );
}