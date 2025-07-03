import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LoginForm = () => {
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value});

  const [accountType, setAccountType] = useState('user');

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await login(formData, accountType); // <-- pass accountType
    if (!result.success) setError(result.message);
    else setError('');
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

        <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
          <option value="user">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
