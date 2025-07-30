import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import LandingPage from './pages/Landingpage'; // Import Landing Page
import ProfilePage from './pages/student/Profilepage';
import AdminDashboard from './pages/admin/Admindashboard';


import FacultyDepartmentRequests from './pages/staff/FacultyDepartmentRequests';
import FacultyDepartmentRequirements from './pages/faculty/FacultyDepartmentRequirements';
import StaffDashboard from './pages/staff/Staffdashboard';

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

function App() {
  return (
    <Router>
      <Layout>
        <Navbar/>
        <Routes>
          <Route path="/" element={< LandingPage/>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />


          {/* Faculty routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/department-requests" element={<FacultyDepartmentRequests />} />
          <Route path="/staff/department-requirements" element={<FacultyDepartmentRequirements />} /> 

          {/* Student routes */}
          <Route path='/student/clearancestatus' element={<ClearanceStatusPage/>}/>
          <Route path="/student/clearance" element={<CreateStudentClearance/>} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/analytics" element={<StudentSubjectAnalytics />} />

          {/* Admin routes */}
          <Route path="/admin/departmentmanagement" element={<DepartmentManagement />} />
          <Route path="/admin/clearancerequest" element={<AdminClearanceRequests />} />
          <Route path="/admin/subjectmanagement" element={<SubjectManagement />} />
          <Route path="/admin/teachermanagement" element={<TeacherManagement />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/staffmanagement" element={<StaffManagement />} />
          <Route path="/studentmanagement" element={<StudentManagement />} /> 
          <Route path="/admin/analytics" element={<AnalyticsPage />} />

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
