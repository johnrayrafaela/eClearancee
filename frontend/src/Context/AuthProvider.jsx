import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const type = localStorage.getItem('userType');
    const storedUser = localStorage.getItem('user');
    if (token && type && storedUser) {
      setUserType(type);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (formData, type = 'user') => {
    try {
      let endpoint;
      if (type === 'teacher') endpoint = 'http://localhost:5000/api/teachers/login';
      else if (type === 'admin') endpoint = 'http://localhost:5000/api/admins/login';
      else if (type === 'staff') endpoint = 'http://localhost:5000/api/staff/login';
      else endpoint = 'http://localhost:5000/api/users/login';

      const res = await axios.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userType', type);
      const userObj =
        type === 'teacher' ? res.data.teacher :
        type === 'admin' ? res.data.admin :
        type === 'staff' ? res.data.staff :
        res.data.user;
      setUser(userObj);
      setUserType(type);
      localStorage.setItem('user', JSON.stringify(userObj));
      // Return userType for redirect
      return { success: true, userType: type };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (formData, type = 'user') => {
    try {
      // Normalize incoming type (support legacy 'faculty')
      let normalized = (type || 'user').toLowerCase().trim();
      if (normalized === 'faculty') normalized = 'staff';
      const allowed = ['user','teacher','admin','staff'];
      if (!allowed.includes(normalized)) {
        return { success: false, message: `Unsupported account type: ${type}` };
      }

      let endpoint;
      switch (normalized) {
        case 'teacher': endpoint = 'http://localhost:5000/api/teachers/register'; break;
        case 'admin': endpoint = 'http://localhost:5000/api/admins/register'; break;
        case 'staff': endpoint = 'http://localhost:5000/api/staff/register'; break;
        default: endpoint = 'http://localhost:5000/api/users/register';
      }

      const res = await axios.post(endpoint, formData);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, userType, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;