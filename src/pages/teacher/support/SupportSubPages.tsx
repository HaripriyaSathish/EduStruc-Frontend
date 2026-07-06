// src/pages/teacher/support/SupportSubPages.tsx
// Contains: ResetCredentials, BulkUpload, VirtualClassroom, Community pages

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Upload, Monitor, Users2, Download, Check, Copy, ExternalLink } from 'lucide-react';
import { getSession } from '../../../utils/auth';
import AvatarCircle from '../../../components/AvatarCircle';

function SubPageShell({ title, crumb, children }: { title: string; crumb: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  const user     = getSession();
  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#F8F9FF', borderBottom: '1px solid #E5E7EB', height: 'auto', minHeight: '80px', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/support')}>Support</span>
          <span style={{ color: '#C6C6CD' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>{crumb}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
          <AvatarCircle size={36} />
        </div>
      </header>
      <main style={{ padding: '32px', maxWidth: '760px', margin: '0 auto' }}>
        <button onClick={() => navigate('/teacher/support')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', marginBottom: '24px', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0051D5')}
          onMouseLeave={e => (e.currentTarget.style.color = '#76777D')}>
          <ArrowLeft size={15} /> Back to Support
        </button>
        {children}
      </main>
    </div>
  );
}

// ── 1. Reset Credentials ─────────────────────────────────
export function ResetCredentials() {
  const navigate = useNavigate();
  const steps = [
    { step: '1', title: 'Go to Login Page', desc: 'Visit the EduStruc teacher login at /teacher/login' },
    { step: '2', title: 'Click Forgot Password', desc: 'Below the login form, click the "Forgot Password?" link' },
    { step: '3', title: 'Enter Your Email', desc: 'Type your institutional email address (e.g. name@school.edu)' },
    { step: '4', title: 'Check Your Email', desc: 'A reset link will be sent within 2 minutes. Check spam if not received.' },
    { step: '5', title: 'Set New Password', desc: 'Click the link and set a new password (minimum 8 characters)' },
  ];
  return (
    <SubPageShell title="Resetting Credentials" crumb="Resetting Credentials">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#EFF4FF', borderRadius: '10px', padding: '10px', display: 'flex' }}>
          <RefreshCw size={22} color="#0051D5" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: 0 }}>Resetting Credentials</h1>
          <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Account & Access • 3 min read</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '10px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ background: '#0051D5', color: '#fff', fontWeight: 700, fontSize: '13px', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.step}</div>
            <div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', margin: '0 0 4px' }}>{s.title}</p>
              <p style={{ fontSize: '13px', color: '#45464D', margin: 0 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px' }}>
        <p style={{ fontWeight: 600, fontSize: '13px', color: '#92400E', margin: '0 0 4px' }}>⚠ SSO Users</p>
        <p style={{ fontSize: '13px', color: '#78350F', margin: 0 }}>If your institution uses Single Sign-On (SSO), contact your IT administrator directly — the self-service reset will not work for SSO accounts.</p>
      </div>

      <div style={{ background: '#EFF4FF', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', color: '#0051D5', margin: 0, fontWeight: 500 }}>Still locked out? Submit a support ticket.</p>
        <button onClick={() => navigate('/teacher/support')}
          style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          Submit Ticket
        </button>
      </div>
    </SubPageShell>
  );
}

// ── 2. Bulk Student Upload ───────────────────────────────
export function BulkUpload() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const csvTemplate = `full_name,email,roll_number,class_name,section,academic_year,status,phone,gender
John Smith,john.smith@school.edu,STU-2024-001,10th Grade,A,2024-2025,active,9876543210,M
Jane Doe,jane.doe@school.edu,STU-2024-002,10th Grade,B,2024-2025,active,9876543211,F`;

  const copyTemplate = () => {
    navigator.clipboard.writeText(csvTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'edustruc_student_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SubPageShell title="Bulk Student Upload" crumb="Bulk Student Upload">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#ECFDF5', borderRadius: '10px', padding: '10px', display: 'flex' }}>
          <Upload size={22} color="#059669" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: 0 }}>Bulk Student Upload</h1>
          <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Student Management • 5 min read</p>
        </div>
      </div>

      {/* CSV Template */}
      <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>CSV Template</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={copyTemplate}
              style={{ background: '#F0F4FF', border: '1px solid #DCE9FF', color: '#0051D5', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
            <button onClick={downloadTemplate}
              style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={12} /> Download .CSV
            </button>
          </div>
        </div>
        <pre style={{ background: '#F8F9FF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '14px', fontSize: '11px', color: '#45464D', overflow: 'auto', margin: 0, lineHeight: 1.6 }}>
          {csvTemplate}
        </pre>
      </div>

      {/* Required columns */}
      <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: '0 0 14px' }}>Required Columns</h3>
        {[
          { col: 'full_name',     req: true,  desc: 'Student full name' },
          { col: 'email',         req: true,  desc: 'Institutional email address' },
          { col: 'roll_number',   req: true,  desc: 'Unique student ID' },
          { col: 'class_name',    req: true,  desc: 'Grade or class name' },
          { col: 'section',       req: false, desc: 'Section (A, B, C...)' },
          { col: 'academic_year', req: false, desc: 'e.g. 2024-2025' },
          { col: 'status',        req: false, desc: 'active / inactive (default: active)' },
          { col: 'phone',         req: false, desc: 'Phone number' },
          { col: 'gender',        req: false, desc: 'M / F / O' },
        ].map(row => (
          <div key={row.col} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F4FF' }}>
            <code style={{ background: '#F0F4FF', color: '#0051D5', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', minWidth: '130px', fontWeight: 500 }}>{row.col}</code>
            <span style={{ background: row.req ? '#FEE2E2' : '#F0F4FF', color: row.req ? '#DC2626' : '#76777D', fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', margin: '0 12px', flexShrink: 0 }}>{row.req ? 'REQUIRED' : 'OPTIONAL'}</span>
            <span style={{ fontSize: '13px', color: '#45464D' }}>{row.desc}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#EFF4FF', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500, margin: 0 }}>After downloading, go to Students → Add New Student → Bulk Import</p>
        <button onClick={() => navigate('/teacher/students/new')}
          style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          Go to Add Student
        </button>
      </div>
    </SubPageShell>
  );
}

// ── 3. Virtual Classroom Integration ────────────────────
export function VirtualClassroom() {
  const navigate = useNavigate();
  return (
    <SubPageShell title="Virtual Classroom Integration" crumb="Virtual Classroom">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#F3E8FF', borderRadius: '10px', padding: '10px', display: 'flex' }}>
          <Monitor size={22} color="#7C3AED" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#0B1C30', margin: 0 }}>Virtual Classroom Integration</h1>
          <p style={{ fontSize: '12px', color: '#76777D', margin: 0 }}>Tools • 8 min read</p>
        </div>
      </div>

      {[
        { title: 'Zoom Integration', color: '#2D8CFF', steps: ['Go to /teacher/schedules → click any class block', 'Click "Add Meeting Link"', 'Paste your Zoom meeting URL', 'Click Save — the link appears on the class block', 'Students see the link in their schedule view automatically'] },
        { title: 'Microsoft Teams', color: '#6264A7', steps: ['Open Microsoft Teams → create a new meeting', 'Copy the Join Meeting link', 'Go to /teacher/classes → select course → Class Materials', 'Upload the link as a .txt file named "Teams_Meeting_Link"', 'Students can download and click to join'] },
        { title: 'Google Meet', color: '#00897B', steps: ['Create a Google Meet session from your Google Calendar', 'Copy the meeting URL (meet.google.com/...)', 'Add it to your EduStruc class schedule as the room/location', 'The link will appear in the schedule for your students'] },
      ].map((platform, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: platform.color }}></div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>{platform.title}</h3>
          </div>
          {platform.steps.map((step, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: '#0051D5', fontWeight: 700, fontSize: '12px', flexShrink: 0, marginTop: '1px' }}>{j + 1}.</span>
              <p style={{ fontSize: '13px', color: '#45464D', margin: 0, lineHeight: 1.6 }}>{step}</p>
            </div>
          ))}
        </div>
      ))}

      <div style={{ background: '#EFF4FF', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500, margin: 0 }}>Need help setting up? Submit a support ticket.</p>
        <button onClick={() => navigate('/teacher/support')}
          style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          Get Help
        </button>
      </div>
    </SubPageShell>
  );
}

// ── 4. Educator Community ────────────────────────────────
export function EducatorCommunity() {
  const navigate = useNavigate();
  const TOPICS = [
    { title: 'Gradebook Tips & Tricks',    replies: 124, views: '2.1k', hot: true },
    { title: 'Attendance Automation Setup', replies: 89,  views: '1.4k', hot: true },
    { title: 'Parent Communication Templates', replies: 67, views: '980', hot: false },
    { title: 'Effective Classroom Management', replies: 203, views: '3.2k', hot: false },
    { title: 'EduStruc New Feature Requests', replies: 45, views: '760', hot: false },
  ];
  return (
    <SubPageShell title="Educator Community" crumb="Community">
      <div style={{ background: 'linear-gradient(135deg, #0051D5 0%, #0B1C30 100%)', borderRadius: '16px', padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
        <Users2 size={36} color="rgba(255,255,255,0.8)" style={{ display: 'block', margin: '0 auto 12px' }} />
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff', margin: '0 0 8px' }}>Educator Network</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 20px' }}>Connect with 15,000+ teachers using EduStruc worldwide</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
          {[['15,000+','Teachers'],['2,400+','Discussions'],['98%','Satisfaction']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff', margin: '0 0 2px' }}>{num}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#0B1C30', margin: 0 }}>Popular Discussions</h3>
          <span style={{ fontSize: '12px', color: '#76777D' }}>This week</span>
        </div>
        {TOPICS.map((topic, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < TOPICS.length - 1 ? '1px solid #F0F4FF' : 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFF')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {topic.hot && <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>HOT</span>}
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#0B1C30', margin: 0 }}>{topic.title}</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: '#76777D' }}>{topic.replies} replies</span>
              <span style={{ fontSize: '12px', color: '#76777D' }}>{topic.views} views</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => navigate('/teacher/support')}
          style={{ flex: 1, background: '#fff', border: '1px solid #C6C6CD', color: '#45464D', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          Back to Support
        </button>
        <button style={{ flex: 2, background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ExternalLink size={14} /> Join the Community
        </button>
      </div>
    </SubPageShell>
  );
}