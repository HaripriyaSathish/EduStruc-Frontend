import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing               from './pages/Landing';
import Login                 from './pages/Login';
import ForgotPassword        from './pages/ForgotPassword';
import ResetPassword         from './pages/ResetPassword';
import GetStarted            from './pages/GetStarted';
import LoggedOut             from './pages/LoggedOut';
import Dashboard             from './pages/Dashboard';
import Students              from './pages/Students';
import CreateStudent         from './pages/CreateStudent';
import ViewStudent           from './pages/ViewStudent';
import EditStudent           from './pages/EditStudent';
import Courses               from './pages/Courses';
import CreateCourse          from './pages/CreateCourse';
import Reports               from './pages/Reports';
import ViewCourse            from './pages/ViewCourse';
import EditCourse            from './pages/EditCourse';
import Schedules             from './pages/Schedules';
import CreateSchedule        from './pages/CreateSchedule';
import SystemSettings        from './pages/SystemSettings';
import HelpSupport           from './pages/HelpSupport';
import Teachers               from './pages/Teachers';
import ViewTeacher            from './pages/ViewTeacher';
import TeacherLogin          from './pages/teacher/TeacherLogin';
import TeacherForgotPassword from './pages/teacher/TeacherForgotPassword';
import TeacherResetPassword  from './pages/teacher/TeacherResetPassword';
import TeacherDashboard      from './pages/teacher/TeacherDashboard';
import ExportReports         from './pages/teacher/ExportReports';
import CreateAssignment      from './pages/teacher/CreateAssignment';
import ClassAssignments      from './pages/teacher/ClassAssignments';
import TeacherStudents       from './pages/teacher/TeacherStudents';
import TeacherCreateStudent  from './pages/teacher/TeacherCreateStudent';
import TeacherViewStudent    from './pages/teacher/TeacherViewStudent';
import TeacherEditStudent    from './pages/teacher/TeacherEditStudent';
import TeacherClasses        from './pages/teacher/TeacherClasses';
import TeacherCreateClass    from './pages/teacher/TeacherCreateClass';
import TeacherEditClass      from './pages/teacher/TeacherEditClass';
import TeacherViewClass      from './pages/teacher/TeacherViewClass';
import TeacherSchedules      from './pages/teacher/TeacherSchedules';
import TeacherSettings       from './pages/teacher/TeacherSettings';
import TeacherSupport        from './pages/teacher/TeacherSupport';
import TeacherLoggedOut      from './pages/teacher/TeacherLoggedOut';
import SupportGuides         from './pages/teacher/support/SupportGuides';
import { GuideGradebook, GuideParentComm, GuideAttendance, GuideSecurity } from './pages/teacher/support/GuideTemplate';
import { ResetCredentials, BulkUpload, VirtualClassroom, EducatorCommunity } from './pages/teacher/support/SupportSubPages';
import ProtectedRoute        from './components/ProtectedRoute';
import AllAssignments from './pages/teacher/AllAssignments';
import BulkAttendance from './pages/teacher/BulkAttendance';
import AdminBulkAttendance from './pages/AdminBulkAttendance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/forgot-password"            element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/logged-out"  element={<LoggedOut />} />
        <Route path="/dashboard"         element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/students"          element={<ProtectedRoute allowedRoles={['admin']}><Students /></ProtectedRoute>} />
        <Route path="/students/new"      element={<ProtectedRoute allowedRoles={['admin']}><CreateStudent /></ProtectedRoute>} />
        <Route path="/students/:id"      element={<ProtectedRoute allowedRoles={['admin']}><ViewStudent /></ProtectedRoute>} />
        <Route path="/students/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><EditStudent /></ProtectedRoute>} />
        <Route path="/courses"           element={<ProtectedRoute allowedRoles={['admin']}><Courses /></ProtectedRoute>} />
        <Route path="/courses/new"       element={<ProtectedRoute allowedRoles={['admin']}><CreateCourse /></ProtectedRoute>} />
        <Route path="/courses/:id"       element={<ProtectedRoute allowedRoles={['admin']}><ViewCourse /></ProtectedRoute>} />
        <Route path="/courses/:id/edit"  element={<ProtectedRoute allowedRoles={['admin']}><EditCourse /></ProtectedRoute>} />
        <Route path="/schedules"         element={<ProtectedRoute allowedRoles={['admin']}><Schedules /></ProtectedRoute>} />
        <Route path="/schedules/new"     element={<ProtectedRoute allowedRoles={['admin']}><CreateSchedule /></ProtectedRoute>} />
        <Route path="/settings"          element={<ProtectedRoute allowedRoles={['admin']}><SystemSettings /></ProtectedRoute>} />
        <Route path="/support"           element={<ProtectedRoute allowedRoles={['admin']}><HelpSupport /></ProtectedRoute>} />
        <Route path="/reports"           element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/teachers"          element={<ProtectedRoute allowedRoles={['admin']}><Teachers /></ProtectedRoute>} />
        <Route path="/teachers/:id"      element={<ProtectedRoute allowedRoles={['admin']}><ViewTeacher /></ProtectedRoute>} />
        <Route path="/teacher/login"             element={<TeacherLogin />} />
        <Route path="/teacher/forgot-password"            element={<TeacherForgotPassword />} />
        <Route path="/teacher/reset-password/:uid/:token" element={<TeacherResetPassword />} />
        <Route path="/teacher/logged-out"        element={<TeacherLoggedOut />} />
        <Route path="/teacher/dashboard"         element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/export-reports"    element={<ProtectedRoute allowedRoles={['teacher']}><ExportReports /></ProtectedRoute>} />
        <Route path="/teacher/create-assignment" element={<ProtectedRoute allowedRoles={['teacher']}><CreateAssignment /></ProtectedRoute>} />
        <Route path="/teacher/students"          element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudents /></ProtectedRoute>} />
        <Route path="/teacher/students/new"      element={<ProtectedRoute allowedRoles={['teacher']}><TeacherCreateStudent /></ProtectedRoute>} />
        <Route path="/teacher/students/:id"      element={<ProtectedRoute allowedRoles={['teacher']}><TeacherViewStudent /></ProtectedRoute>} />
        <Route path="/teacher/students/:id/edit" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherEditStudent /></ProtectedRoute>} />
        <Route path="/teacher/classes"           element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClasses /></ProtectedRoute>} />
        <Route path="/teacher/classes/new"       element={<ProtectedRoute allowedRoles={['teacher']}><TeacherCreateClass /></ProtectedRoute>} />
        <Route path="/teacher/classes/:id"       element={<ProtectedRoute allowedRoles={['teacher']}><TeacherViewClass /></ProtectedRoute>} />
        <Route path="/teacher/classes/:id/edit"  element={<ProtectedRoute allowedRoles={['teacher']}><TeacherEditClass /></ProtectedRoute>} />
        <Route path="/teacher/classes/:id/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><ClassAssignments /></ProtectedRoute>} />
        <Route path="/teacher/schedules"         element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSchedules /></ProtectedRoute>} />
        <Route path="/teacher/settings"          element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSettings /></ProtectedRoute>} />
        <Route path="/teacher/support"           element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSupport /></ProtectedRoute>} />
        <Route path="/teacher/support/guides"           element={<ProtectedRoute allowedRoles={['teacher']}><SupportGuides /></ProtectedRoute>} />
        <Route path="/teacher/support/gradebook"        element={<ProtectedRoute allowedRoles={['teacher']}><GuideGradebook /></ProtectedRoute>} />
        <Route path="/teacher/support/parent-comm"      element={<ProtectedRoute allowedRoles={['teacher']}><GuideParentComm /></ProtectedRoute>} />
        <Route path="/teacher/support/attendance"       element={<ProtectedRoute allowedRoles={['teacher']}><GuideAttendance /></ProtectedRoute>} />
        <Route path="/teacher/support/security"         element={<ProtectedRoute allowedRoles={['teacher']}><GuideSecurity /></ProtectedRoute>} />
        <Route path="/teacher/support/reset-credentials" element={<ProtectedRoute allowedRoles={['teacher']}><ResetCredentials /></ProtectedRoute>} />
        <Route path="/teacher/support/bulk-upload"       element={<ProtectedRoute allowedRoles={['teacher']}><BulkUpload /></ProtectedRoute>} />
        <Route path="/teacher/support/virtual-classroom" element={<ProtectedRoute allowedRoles={['teacher']}><VirtualClassroom /></ProtectedRoute>} />
        <Route path="/teacher/support/community"         element={<ProtectedRoute allowedRoles={['teacher']}><EducatorCommunity /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><AllAssignments /></ProtectedRoute>} />
        <Route path="/teacher/attendance/bulk" element={<ProtectedRoute allowedRoles={['teacher']}><BulkAttendance /></ProtectedRoute>} />
        <Route path="/attendance/bulk" element={<ProtectedRoute allowedRoles={['admin']}><AdminBulkAttendance /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;