import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  // Define state for form fields and errors.
  const [formData, setFormData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const BASE_URL = 'http://127.0.0.1:5000';

  // Generic onChange handler for controlled components.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    // Clear previous errors.
    setErrors({});

    // Simple client-side validation.
    const newErrors = {};
    if (!formData.firstname) newErrors.username = 'First is required';
    if (!formData.username) newErrors.email = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';

    // State change and will return if we have new errors.
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    axios.post(`${BASE_URL}/signup`, formData, {withCredentials: true}).then((response) => {
      console.log(response.data);
      if(response.data){
        // Redirect to the homepage after login if user is authenticated.
        navigate('/');
      }else{
        // Handle any errors here, such as displaying a notification to the user.
        setErrors({username: 'Invalid Username or Password', password: 'Invalid Username or Password'});
      }
    }
    ).catch((error) => {
      console.error('Error:', error);
      // Handle any errors here, such as displaying a notification to the user.
    }
    );    
  };

  return (
    <Container className="ml-5 mt-2">
      <h1 className="ml-5 mt-2">Sign Up</h1>
      <Form onSubmit={handleSubmit} className="ml-5 mt-2">

        {/* Username Field */}
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
        </Form.Group><br></br>

        {/* Password Field */}
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
        </Form.Group><br></br>

        {/* First Name Field */}
        <Form.Group controlId="firstname">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter First Name"
          />
          {errors.firstname && <div className="text-danger">{errors.firstname}</div>}
        </Form.Group><br></br>

          {/* Last Name Field */}
          <Form.Group controlId="lastname">
          <Form.Label>Last Name (Optional)</Form.Label>
          <Form.Control
            type="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter Last Name (Optional)"
          />
          {errors.firstname && <div className="text-danger">{errors.firstname}</div>}
        </Form.Group><br></br>

        <Button variant="primary" type="submit">
          Sign Up
        </Button>
      </Form>
    </Container>
  );
};

export default Signup;
