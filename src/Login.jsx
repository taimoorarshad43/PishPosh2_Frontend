import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toastService from './services/toastservice';
import { useUser } from "./services/UserContext";

const Login = () => {
  // Define state for form fields and any validation errors.
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  // Set error fields.
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const BASE_URL = 'http://127.0.0.1:5000';
  const { login } = useUser();

  // Update state on input change.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous errors.
    setErrors({});
    
    // Simple client-side validation.
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';

    // Will append errors to the form and return if we're missing any fields.
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await login(formData);
    if (success) {
      toastService.info("Logged In!");
      navigate('/', { replace: true });
    } else {
      setErrors({
        username: 'Invalid Username or Password',
        password: 'Invalid Username or Password',
      });
    }

  };

  return (
    <Container className="ml-5 mt-2">
      <h1 className="ml-5 mt-2">Login</h1>
      <Form onSubmit={handleSubmit} className="ml-5 mt-2">
        {/* If needed, include hidden inputs (e.g. CSRF token) here */}
        
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
          />
          {errors.username && <div className="text-danger">{errors.username}</div>}
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
          {errors.password && <div className="text-danger">{errors.password}</div>}
        </Form.Group>

        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
