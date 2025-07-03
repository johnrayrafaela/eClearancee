// src/components/RegisterForm.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

const RegisterForm = () => {
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    course: '',
    year_level: '',
    block: '',
  });

  const [message, setMessage] = useState('');
  const [accountType, setAccountType] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAccountTypeChange = e => {
    setAccountType(e.target.value);
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await register(formData, accountType);
    setMessage(result.message);
    if (result.success) {
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        course: '',
        year_level: '',
        block: '',
      });
      setAccountType('');
      setShowForm(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {message && <p>{message}</p>}
      {!showForm ? (
        <div>
          <label>Register as:</label>
          <select value={accountType} onChange={handleAccountTypeChange} required>
            <option value="">Select Account Type</option>
            <option value="user">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} required />
          <input name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          {/* Only show phone input for students */}
          {accountType === 'user' && (
            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="^09\d{9}$"
              maxLength={11}
              required
            />
          )}
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

          {accountType === 'user' && (
            <>
              <select name="course" value={formData.course} onChange={handleChange} required>
                <option value="">Select Course</option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSEd">BSEd</option>
                <option value="BSBA">BSBA</option>
              </select>

              <select name="year_level" value={formData.year_level} onChange={handleChange} required>
                <option value="">Select Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              <select name="block" value={formData.block} onChange={handleChange} required>
                <option value="">Select Block</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </>
          )}

          <button type="submit">Register</button>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;
