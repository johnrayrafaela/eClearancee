import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'user' or 'teacher'

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
      else endpoint = 'http://localhost:5000/api/users/login';

      const res = await axios.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userType', type);
      const userObj =
        type === 'teacher' ? res.data.teacher :
        type === 'admin' ? res.data.admin :
        res.data.user;
      setUser(userObj);
      setUserType(type);
      localStorage.setItem('user', JSON.stringify(userObj));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (formData, type = 'user') => {
    try {
      let endpoint;
      if (type === 'teacher') endpoint = 'http://localhost:5000/api/teachers/register';
      else if (type === 'admin') endpoint = 'http://localhost:5000/api/admins/register';
      else endpoint = 'http://localhost:5000/api/users/register';

      const res = await axios.post(endpoint, formData);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user'); // Remove user
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, userType, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
