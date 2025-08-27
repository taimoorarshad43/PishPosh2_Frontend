import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';

const IndexPage = () => {

  // Set products to be an empty array that we'll populate with an axios.get() call
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get products from our Flask API
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://127.0.0.1:5000/v1/productimages');
        const data = response.data;
        
        if (data && data.Products) {
          setProducts(data.Products);
        } else {
          console.error('Invalid response format from server');
          setError('Invalid response format from server');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        
        if (error.response?.status === 404) {
          setError('Products endpoint not found. Please contact support.');
        } else if (error.response?.status >= 500) {
          setError('Server error occurred. Please try again later.');
        } else if (error.response?.status >= 400) {
          setError('Bad request. Please try refreshing the page.');
        } else if (error.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred while loading products.');
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading products...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger mb-4">Error Loading Products</h2>
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

  // Return JSX that lists the products from our database. 
  // I'll need to figure out pagination for this however.
  return (
    <>
      <h1 className="text-center mt-3">Welcome to PishPosh (Beta)</h1>
      <Container>
        <Row className="text-center">
          {products && products.length > 0 ? (
            products.map(product => (
              <Col md={3} className="mt-5" key={product.productid}>
                {product.image && (
                  <>
                    <Image 
                      src={`data:image/jpeg;base64,${product.image}`} 
                      alt={product.name} 
                      fluid 
                    />
                    <br />
                  </>
                )}
                <Button className = "mt-4" variant="primary" href={`/product/${product.productid}`}>
                  {product.productname}
                </Button>
              </Col>
            ))
          ) : (
            <Container>
              <h4 className="display-4 text-center">No Products Available</h4>
              <p className="lead text-muted">
                There are currently no products listed. Check back later!
              </p>
            </Container>
          )}
        </Row>
      </Container>

      <Container className="text-center mt-5 mb-5">
        {products && products.length > 0 ? (
          <span>
            <Button variant="primary" className="mr-5" href="/?page=previous"> {/* Might need to put the full URL here for pagination to work */}
              Previous Page
            </Button>
            <Button variant="primary" className="ml-5" href="/?page=next">
              Next Page
            </Button>
          </span>
        ) : (
          <span>
            <Button variant="primary" className="mr-5" href="/?page=previous">
              Previous Page
            </Button>
          </span>
        )}
      </Container>
    </>
  );
};

export default IndexPage;
