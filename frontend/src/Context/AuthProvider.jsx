import React, { useState, useEffect } from 'react';
import api from '../api/client';
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
  if (type === 'teacher') endpoint = '/teachers/login';
  else if (type === 'admin') endpoint = '/admins/login';
  else if (type === 'staff') endpoint = '/staff/login';
  else endpoint = '/users/login';

  const res = await api.post(endpoint, formData);
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
        case 'teacher': endpoint = '/teachers/register'; break;
        case 'admin': endpoint = '/admins/register'; break;
        case 'staff': endpoint = '/staff/register'; break;
        default: endpoint = '/users/register';
      }

      const res = await api.post(endpoint, formData);
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