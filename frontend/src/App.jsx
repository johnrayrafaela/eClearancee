import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import LandingPage from './pages/Landingpage'; // Import Landing Page
import ProfilePage from './pages/student/Profilepage';
import AdminDashboard from './pages/admin/Admindashboard';


import TeacherDashboard from './pages/teacher/Teacherdashboard';
import TeacherSubjectRequests from './pages/teacher/TeacherSubjectRequests'; // Import Teacher Subject Requests

import ClearanceStatusPage from './pages/student/ClearanceStatusPage';
import CreateStudentClearance from './pages/student/createClearancePage';
import StudentDashboard from './pages/student/Studentdashboard';
import StaffDashboard from './pages/staff/Staffdashboard'; // Import Staff Dashboard
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';

import AdminClearanceRequests from './pages/admin/AdminClearanceRequests';
import SubjectManagement from './pages/admin/SubjectManagement';
import StaffManagement from './pages/admin/StaffManagement';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement'; // Import Teacher Management

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

          {/* Staff routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />

          {/* Student routes */}
          <Route path='/student/clearancestatus' element={<ClearanceStatusPage/>}/>
          <Route path="/student/clearance" element={<CreateStudentClearance/>} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />

          {/* Admin routes */}
          <Route path="/admin/clearancerequest" element={<AdminClearanceRequests />} />
          <Route path="/admin/subjectmanagement" element={<SubjectManagement />} />
          <Route path="/admin/teachermanagement" element={<TeacherManagement />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/staffmanagement" element={<StaffManagement />} />
          <Route path="/studentmanagement" element={<StudentManagement />} />

          {/* Teacher routes */}
          <Route path="/teacher/subject-requests" element={<TeacherSubjectRequests />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
