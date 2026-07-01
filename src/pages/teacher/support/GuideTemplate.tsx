// Generic guide page — used for all 4 guide routes
// src/pages/teacher/support/GuideGradebook.tsx (copy for each)
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';
import { getSession } from '../../../utils/auth';
import AvatarCircle from '../../../components/AvatarCircle';

interface Props {
  title: string;
  category: string;
  readTime: string;
  sections: { heading: string; content: string; steps?: string[] }[];
}

function GuidePage({ title, category, readTime, sections }: Props) {
  const navigate = useNavigate();
  const user     = getSession();
  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #C6C6CD', height: '64px', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/support')}>Support</span>
          <span style={{ color: '#C6C6CD' }}>/</span>
          <span style={{ fontSize: '13px', color: '#76777D', cursor: 'pointer' }} onClick={() => navigate('/teacher/support/guides')}>Guides</span>
          <span style={{ color: '#C6C6CD' }}>/</span>
          <span style={{ fontSize: '13px', color: '#0051D5', fontWeight: 500 }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/teacher/settings')}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#0B1C30', margin: 0 }}>{user?.full_name || 'Teacher'}</p>
          <AvatarCircle size={36} />
        </div>
      </header>
      <main style={{ padding: '32px', maxWidth: '760px', margin: '0 auto' }}>
        <button onClick={() => navigate('/teacher/support/guides')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#76777D', fontSize: '13px', marginBottom: '24px', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0051D5')}
          onMouseLeave={e => (e.currentTarget.style.color = '#76777D')}>
          <ArrowLeft size={15} /> Back to All Guides
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ background: '#EFF4FF', color: '#0051D5', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>{category}</span>
          <span style={{ fontSize: '12px', color: '#76777D' }}>{readTime}</span>
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#0B1C30', margin: '0 0 24px', lineHeight: 1.3 }}>{title}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#0B1C30', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="#0051D5" /> {s.heading}
              </h2>
              <p style={{ fontSize: '14px', color: '#45464D', lineHeight: 1.7, margin: s.steps ? '0 0 14px' : 0 }}>{s.content}</p>
              {s.steps && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {s.steps.map((step, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle size={15} color="#009668" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '13px', color: '#45464D', margin: 0, lineHeight: 1.6 }}>{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ background: '#EFF4FF', borderRadius: '12px', padding: '20px', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '13px', color: '#0051D5', margin: 0, fontWeight: 500 }}>Still need help with this topic?</p>
          <button onClick={() => navigate('/teacher/support')}
            style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Submit a Ticket
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Export 4 guide pages ─────────────────────────────────

export function GuideGradebook() {
  return <GuidePage
    title="Gradebook Configuration"
    category="Grading"
    readTime="5 min read"
    sections={[
      { heading: 'Overview', content: 'EduStruc\'s gradebook allows you to configure weighted averages, custom grading scales, and automatic grade calculations for your courses.' },
      { heading: 'Setting Up Grade Weights', content: 'Assign percentage weights to different assessment types to calculate final grades automatically.', steps: ['Go to /teacher/classes → select a course → Gradebook tab', 'Click "Grade Settings" to configure weights', 'Set weights: Assignments 30%, Quizzes 20%, Midterm 20%, Final 30%', 'Click Save — grades recalculate instantly'] },
      { heading: 'Custom Grading Scale', content: 'Configure the grade boundaries used across your courses.', steps: ['A: 90–100%', 'B+: 80–89%', 'B: 70–79%', 'C: 60–69%', 'D: 50–59%', 'F: Below 50%'] },
      { heading: 'Overriding a Grade', content: 'You can manually override any student\'s calculated grade.', steps: ['Gradebook tab → find the student', 'Click the NEW SCORE column input field', 'Type a score from 0–100', 'The FINAL GRADE badge updates live', 'Click "Save All Grades"'] },
    ]}
  />;
}

export function GuideParentComm() {
  return <GuidePage
    title="Parent-Teacher Communication"
    category="Communication"
    readTime="4 min read"
    sections={[
      { heading: 'Overview', content: 'EduStruc provides automated weekly progress reports and direct messaging to keep parents informed about their child\'s academic performance.' },
      { heading: 'Setting Up Automated Reports', content: 'Configure weekly email reports that automatically go to parent/guardian contacts.', steps: ['Go to Settings → Notification Triggers', 'Enable "Student Direct Messages"', 'Set report frequency: Weekly every Monday', 'Include: Attendance %, current grade, upcoming assignments'] },
      { heading: 'Adding Guardian Contact', content: 'Each student profile supports guardian contact information.', steps: ['Students → select student → Edit', 'Fill in Guardian Full Name and Emergency Phone', 'Save Changes — contact is now linked to the student'] },
      { heading: 'Direct Message Notifications', content: 'Enable push notifications for urgent queries from parents via the Settings → Notification Triggers panel.' },
    ]}
  />;
}

export function GuideAttendance() {
  return <GuidePage
    title="Attendance Automation"
    category="Attendance"
    readTime="6 min read"
    sections={[
      { heading: 'Overview', content: 'Automate your morning roll-call using QR codes, biometric integration, or manual entry within EduStruc SMS.' },
      { heading: 'Manual Attendance Entry', content: 'Mark attendance directly from the student roster.', steps: ['Go to /teacher/students', 'Find the student → view their profile', 'Attendance is tracked as Active/Inactive status', 'Update status to reflect attendance'] },
      { heading: 'Attendance Thresholds', content: 'EduStruc automatically flags students below 70% attendance.', steps: ['Students below 70% are shown in red on the roster', 'Their status changes to "Probation" automatically', 'The Action Required card on the dashboard alerts you', 'Review All Alerts to see the full at-risk list'] },
      { heading: 'QR Code Integration', content: 'Generate unique QR codes per class session so students can self-check-in using their phone camera. Available under Class → Settings → QR Check-In.' },
    ]}
  />;
}

export function GuideSecurity() {
  return <GuidePage
    title="Security & Data Privacy"
    category="Security"
    readTime="7 min read"
    sections={[
      { heading: 'FERPA Compliance', content: 'EduStruc is fully FERPA-compliant. All student records are encrypted at rest and in transit. Only authorized faculty and administrators can access individual student data.' },
      { heading: 'Two-Factor Authentication', content: 'Enable 2FA to add an extra layer of security to your account.', steps: ['Go to /teacher/settings → Security Context', 'Toggle the Two-Factor Auth switch to ON', 'A verification code will be sent to your registered email on every login', 'Enter the code within 10 minutes to complete login'] },
      { heading: 'Password Security', content: 'Keep your account secure with a strong password.', steps: ['Minimum 8 characters required', 'Use a mix of uppercase, lowercase, numbers, and symbols', 'Change password every 90 days recommended', 'Never share your credentials with anyone'] },
      { heading: 'Data Access Controls', content: 'As a teacher, you have read/write access to your own class data only. Admin portals are separately controlled. All access is logged and auditable by your institution\'s IT administrator.' },
      { heading: 'Account Deactivation', content: 'If you need to deactivate your account, go to Settings → Account Security Management → Deactivate Portal. All your data will be archived and accessible to your administrator.' },
    ]}
  />;
}