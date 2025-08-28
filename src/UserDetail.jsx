import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from './config/api.js';

import { toast } from 'react-toastify';

const UserDetail = (props) => {

  console.log("From UserDetail.jsx - The props we got back were ", props);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Form state for new product listing
  const [formData, setFormData] = useState({
    productName: '',
    productPrice: '',
    productDescription: '',
    productImage: null,
  });
  const [errors, setErrors] = useState({});
  const userId = props.id;
  const user = props;                                 // Will be passing user object from App.jsx
  const username = props.username;
  const toastId = React.useRef(null);
  const navigate = useNavigate();
  
    // If we're not logged in, then we don't have a username and we need to be redirected to index
    // Send a Toast message saying we're not logged in
    useEffect(() =>{
      if(!username){
        navigate('/', {replace : true});
        if(! toast.isActive(toastId.current)) {     // Doing this to prevent duplicate Toast messages
          toastId.current = toast.info("Please Log In to view your profile");
        }
      }
    })

  // Fetch user products when the component mounts.
  useEffect(() => {
    const getProducts = async () => {
      if (userId){
        try {
          setLoading(true);
          setError(null);
          
          const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.USERS}/${userId}/products`);
          if(response && response.data.User && response.data.User.products){
              // Set products with response data.
              const data = response.data.User.products;
              console.log(data);
              setProducts(data);
          } else {
              console.error('Error fetching user data: Invalid response format');
              setError('Invalid response format from server');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          if (error.response?.status === 404) {
            setError('User profile not found. Please check your login status.');
          } else if (error.response?.status >= 500) {
            setError('Server error occurred. Please try again later.');
          } else if (error.response?.status >= 400) {
            setError('Bad request. Please check your login status.');
          } else if (error.code === 'NETWORK_ERROR') {
            setError('Network error. Please check your connection.');
          } else {
            setError('An unexpected error occurred. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        console.log("From UserDetail.jsx - Waiting on userId");
        setLoading(false);
      }
    }
    getProducts();
  }, [userId]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission to add a new product
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('productName', formData.productName);
    data.append('productDescription', formData.productDescription);
    data.append('productPrice', formData.productPrice);
    if (formData.productImage) {
      data.append('productImage', formData.productImage);
    }
    axios
      .post(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD}/${userId}`, data, {withCredentials: true})
      .then(response => {
        // Refresh the product list after successful upload or update error fields if we got any.
        console.log("From UserDetail.jsx - The response we got back was ", response);
        return axios.get(`${API_BASE_URL}${API_ENDPOINTS.USERS}/${userId}/products`);
      })
      .then(res => {
        if (res.data.User && res.data.User.products) {
          setProducts(res.data.User.products);
        } else {
          setProducts([]);
        }
        // Clear form fields after successful submission
        setFormData({
          productName: '',
          productPrice: '',
          productDescription: '',
          productImage: null,
        });
        // Clear any previous errors
        setErrors({});
      })
      .catch(err => {   // We'll get a HTTP 400 if any fields are missing. From there we'll set error messages from the API.
        console.error('Error uploading product:', err);
        if (err.response?.data?.error) {
          setErrors(err.response.data.error);
        } else {
          setErrors({ submit: 'An unexpected error occurred while uploading the product.' });
        }
      });
  };

  // Handle product deletion
  const handleDelete = (productId) => {
    axios
      .delete(`${API_BASE_URL}/product/${productId}/delete`, null, {withCredentials: true})
      .then(response => {
        console.log("From UserDetail.jsx - The response we got back was ", response);
        setProducts(products.filter(product => product.productid !== productId));           // Deleting product from state
        if (response.data && response.data.status) {
          toastService[response.data.status](response.data.message);
        } else {
          toastService.success("Product deleted successfully");
        }
      })
      .catch(err => {
        console.error('Error deleting product:', err);
        toastService.error("Error deleting product");
      });
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your profile...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger mb-4">Error Loading Profile</h2>
        <p className="lead mb-4">{error}</p>
        <button 
          className="btn btn-primary me-2" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
        <a href="/" className="btn btn-secondary">
          Go Back Home
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="ml-3 mt-3 mb-5">{user.firstname}'s Profile Page</h1>
      <div className="container">
        <div className="row text-center">
          {/* Left column: User's products */}
          <div className="col-6">
            <h2 className="mb-5">{user.firstname} {user.lastname}'s Products</h2>
            {products.length === 0 ? (
              <div className="text-muted">
                <p>You haven't listed any products yet.</p>
                <p>Use the form on the right to add your first product!</p>
              </div>
            ) : (
              Object.values(products).map(product => (
                <div key={product.productid} className="mb-5">
                  {product.image && (
                    <>
                      <img 
                        src={`data:image/jpeg;base64,${product.image}`} 
                        alt={product.name} 
                      /><br />
                      <div className = "mt-4">
                        <a className="btn btn-primary" href={`/product/${product.productid}`}>
                          {product.productname}
                        </a>
                        <span className="badge ml-3">Price: ${product.price}.00</span>
                        <span className="badge ml-3">
                          {/* <a href={`/product/${product.productid}/delete`}>Delete?</a> */}
                          <a href="#" onClick={(e) => {
                              e.preventDefault();                                 // Have this do a POST request to the delete endpoint
                              handleDelete(product.productid);}}>Delete?</a>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          {/* Right column: New product listing form */}
          <div className="col-6 text-left">
            <h2 className="mb-5">Add New Product Listing?</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div>
                <label className="btn-primary mb-3" htmlFor="productName">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  id="productName"
                  value={formData.productName}
                  onChange={handleChange}
                />
                {errors.productName && <span className = 'text-primary float-right'>{errors.productName}</span>}
              </div>
              <div>
                <label className="btn-primary mb-3" htmlFor="productDescription">
                  Product Description
                </label>
                <input
                  type="text"
                  name="productDescription"
                  id="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                />
                {errors.productDescription && <span className = 'text-primary float-right'>{errors.productDescription}</span>}
              </div>
              <div>
                <label className="btn-primary mb-3" htmlFor="productPrice">
                  Product Price
                </label>
                <input
                  type="number"
                  name="productPrice"
                  id="productPrice"
                  value={formData.productPrice}
                  onChange={handleChange}
                />
                {errors.productPrice && <span className = 'text-primary float-right'>{errors.productPrice}</span>}
              </div>
              <div>
                <label className="btn-primary mb-3" htmlFor="productImage">
                  Product Image
                </label>
                <input
                  type="file"
                  name="productImage"
                  id="productImage"
                  onChange={handleChange}
                />
                {errors.productImage && <span className = 'text-primary float-right'>{errors.productImage}</span>}
              </div>
              <input
                className="submit-button btn btn-primary mt-3"
                type="submit"
                value="Confirm?"
              />
              {errors.submit && <div className="error">{errors.submit}</div>}
              <span><a className="ml-3 mt-3 btn btn-primary" href={`/upload/${user.id}/ai`}>
              Add AI description?
            </a></span>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
