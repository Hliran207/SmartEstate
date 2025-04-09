import React, {useState} from 'react'
import axios from 'axios'

/*workflow
1. const Register (arrow function)- handel the usestate for regsitration
2. usestate for msg and for error
3. handel change: 

*/


const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const isValidPassword = (password) => {
    const minLength = /.{8,}/;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      minLength.test(password) &&
      hasNumber.test(password) &&
      hasSpecialChar.test(password)
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setValidationError('');

    const {password, confirm_password} = formData;
    if(password !== confirm_password){
      setValidationError('Passwords do not match!');
      return;
    }
    if (!isValidPassword(password)) {
      setValidationError("Password must be at least 8 characters, include a number and a special character.");
      return;
    }
    try {
      const {confirm_password, ...payload} = formData;
      const response = await axios.post('http://localhost:8000/users/', payload);
      setMessage('User registered successfully!');
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password:''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">Register</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {validationError && <div className="alert alert-warning">{validationError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            className="form-control"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;


