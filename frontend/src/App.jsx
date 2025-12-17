import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/Landingpage'; // Import Landing Page
import ProfilePage from './pages/student/Profilepage';
import AdminDashboard from './pages/admin/Admindashboard';


import FacultyDepartmentRequests from './pages/staff/FacultyDepartmentRequests';
import FacultyDepartmentRequirements from './pages/staff/FacultyDepartmentRequirements';
import StaffDashboard from './pages/staff/Staffdashboard';
import StaffProfilePage from './pages/staff/StaffProfilePage';

import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage'; // Import Teacher Analytics Page
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import TeacherSubjectRequirements from './pages/teacher/TeacherSubjectRequirements'; // Import Teacher Subject Requirements
import TeacherDashboard from './pages/teacher/Teacherdashboard';
import TeacherSubjectRequests from './pages/teacher/TeacherSubjectRequests'; // Import Teacher Subject Requests
import TeacherAddSubject from './pages/teacher/TeacherAddSubject';

import ClearanceStatusPage from './pages/student/ClearanceStatusPage';
import CreateStudentClearance from './pages/student/createClearancePage';
import StudentDashboard from './pages/student/Studentdashboard';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';


import DepartmentManagement from './pages/admin/DepartmentManagement';
import AdminClearanceRequests from './pages/admin/AdminClearanceRequests';
import SubjectManagement from './pages/admin/SubjectManagement';
import StaffManagement from './pages/admin/StaffManagement';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement'; // Import Teacher Management
import AnalyticsPage from './pages/admin/AnalyticsPage';
import StudentSubjectAnalytics from './pages/student/StudentSubjectAnalytics';
import StaffAnalytics from './pages/staff/StaffAnalytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={< LandingPage/>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />


          {/* Faculty routes */}
          <Route path="/staff/analytics" element={<StaffAnalytics />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/department-requests" element={<FacultyDepartmentRequests />} />
          <Route path="staff/department-requirements" element={<FacultyDepartmentRequirements />} /> 
          <Route path="/staff/profile" element={<StaffProfilePage />} />

          {/* Student routes */}
          <Route path='/student/clearancestatus' element={<ClearanceStatusPage/>}/>
          <Route path="/student/clearance" element={<CreateStudentClearance/>} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/analytics" element={<StudentSubjectAnalytics />} />

          {/* Admin routes */}
          <Route path="/admin/departmentmanagement" element={<ProtectedRoute allowedRoles={['admin']}><DepartmentManagement /></ProtectedRoute>} />
          <Route path="/admin/clearancerequest" element={<ProtectedRoute allowedRoles={['admin']}><AdminClearanceRequests /></ProtectedRoute>} />
          <Route path="/admin/subjectmanagement" element={<ProtectedRoute allowedRoles={['admin']}><SubjectManagement /></ProtectedRoute>} />
          <Route path="/admin/teachermanagement" element={<ProtectedRoute allowedRoles={['admin']}><TeacherManagement /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/staffmanagement" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>} />
          <Route path="/studentmanagement" element={<ProtectedRoute allowedRoles={['admin']}><StudentManagement /></ProtectedRoute>} /> 
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsPage /></ProtectedRoute>} />

          {/* Teacher routes */}
          <Route path="/teacher/add-subject" element={<TeacherAddSubject />} />
          <Route path="/teacher/analytics" element={<TeacherAnalyticsPage />} />
          <Route path="/teacher/profile" element={<TeacherProfilePage />} />
          <Route path="/teacher/subject-requirements" element={<TeacherSubjectRequirements />} />
          <Route path="/teacher/subject-requests" element={<TeacherSubjectRequests />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
