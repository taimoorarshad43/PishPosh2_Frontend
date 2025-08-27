import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const User = () => {
  // Local state to store the user information and products list.
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const { userid } = useParams();

  // Fetch user details and products when the component mounts.
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        
        const response = await axios.get(`http://localhost:5000/v1/users/${userid}`);
        if (response && response.data.User) {
          const data = response.data.User;
          console.log(data);
          setUser(data);
        } else {
          console.error('Error fetching user data: Invalid response format');
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        if (error.response?.status === 404) {
          setNotFound(true);
        } else if (error.response?.status >= 500) {
          setError('Server error occurred. Please try again later.');
        } else if (error.response?.status >= 400) {
          setError('Bad request. Please check the URL and try again.');
        } else if (error.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    const getProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/v1/users/${userid}/products`);
        if (response && response.data.User && response.data.User.products) {
          const data = response.data.User.products;
          console.log(data);
          setProducts(data);
        } else {
          console.error('Error fetching products: Invalid response format');
          // Don't set error here as user might exist but have no products
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // If products fail to load, just set empty array
        setProducts([]);
      }
    };

    getUser();
    getProducts();
  }, [userid]);

  // Show loading state
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading user profile...</p>
      </div>
    );
  }

  // Show 404 state
  if (notFound) {
    return (
      <div className="container text-center mt-5">
        <h1 className="display-1 text-muted">404</h1>
        <h2 className="mb-4">User Not Found</h2>
        <p className="lead mb-4">
          The user you're looking for doesn't exist or has been removed.
        </p>
        <a href="/" className="btn btn-primary">
          Go Back Home
        </a>
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

  // Show user profile
  if (!user) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-warning mb-4">Profile Not Available</h2>
        <p className="lead mb-4">
          Unable to load user profile. Please try again later.
        </p>
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
          <div className="col-12">
            <h2 className="mb-5">{user.firstname} {user.lastname}'s Products</h2>
            {products.length === 0 ? (
              <div className="text-muted">
                <p>This user hasn't listed any products yet.</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product.productid} className="mb-5">
                  {product.image && (
                    <>
                      <img 
                        src={`data:image/jpeg;base64,${product.image}`} 
                        alt={product.name} 
                      /><br></br>
                      <a className="btn btn-primary mt-4" href={`/product/${product.productid}`}>
                        {product.productname}
                      </a>
                      <span className="badge ml-3">
                        Price: ${product.price}.00
                      </span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
