import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import HomePage from './pages/student/Homepage';
import ProfilePage from './pages/student/Profilepage';
import AdminDashboard from './pages/admin/Admindashboard';
import TeacherDashboard from './pages/teacher/Teacherdashboard';
import StudentDashboard from './pages/student/Studentdashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Navbar/>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Teacher routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
