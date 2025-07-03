import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Homepage';
import StudentClearanceDashboard from './pages/StudentClearanceDashboard';
import Layout from './components/Layout';
import ProfilePage from './pages/ProfilePage';

function App() {
  

  return (
    <Router>
      <Layout>
        <Navbar/>
        <Routes>
          <Route path="/student-clearance-dashboard" element={<StudentClearanceDashboard />} />
          {/* Add other routes here as needed */}
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Add more routes as needed */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
