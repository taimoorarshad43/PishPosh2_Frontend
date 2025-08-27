import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';

import toastService from './services/toastservice';

const ProductDetail = () => {
  // Extract the product id from the URL
  const { productid } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product data when the component mounts or productid changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        
        const response = await axios.get(`http://127.0.0.1:5000/v1/productsimages/${productid}`, {withCredentials: true});
        if (response && response.data && response.data.Product) {
          const data = response.data;
          console.log(data)
          setProduct(data.Product);
        } else {
          console.error('Failed to fetch product data: Invalid response format');
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        
        if (error.response?.status === 404) {
          setNotFound(true);
        } else if (error.response?.status >= 500) {
          setError('Server error occurred. Please try again later.');
        } else if (error.response?.status >= 400) {
          setError('Bad request. Please check the product ID.');
        } else if (error.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred while loading the product.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productid]);

  // Fetch related products when the component mounts or productid changes
  useEffect(() => {
    const fetchRelatedProduct = async () => {
      try {
        const response = await axios.post(`http://127.0.0.1:5000/product/${productid}/related`, {}, {withCredentials: true});
        if (response && response.data && response.data.RelatedProducts) {
          const data = response.data;
          console.log(data)
          setRelatedProducts(data.RelatedProducts);
        } else {
          console.error('Failed to fetch related products: Invalid response format');
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        // Don't set error for related products, just set empty array
        setRelatedProducts([]);
      }
    };

    fetchRelatedProduct();
  }, [productid]);

  // Handler to add product to the cart using a POST request.
  const handleAddToCart = async () => {
    try{
      const response = await axios.post(`http://127.0.0.1:5000/product/${productid}/addtocart`, {}, {withCredentials: true});
      console.log(response);
      if (response.data.status === 'success') {
        // We'll console.log as well as show a toast message based on the message we receive from the backend
        console.log('Product added to cart');
        toastService[response.data.status](response.data.message);
      } else {
        console.log('Failed to add product to cart');
        toastService.error("Failed to add product to cart");
      }
    }catch{
      console.log('Catch Block, failed to add product to cart')
      toastService.error("Failed to add product to cart - Please Login")
    }
  };

  // Handler to remove product from the cart using a POST request.
  const handleRemoveFromCart = async () => {
    try{
      const response = await axios.post(`http://127.0.0.1:5000/product/${productid}/removefromcart`, {}, {withCredentials: true});
      console.log(response);
      if (response.data.status === 'success') {
        // We'll console.log as well as show a toast message based on the message we receive from the backend
        console.log('Product removed to cart');
        toastService[response.data.status](response.data.message);
      } else {
        console.error('Failed to remove product to cart');
        toastService.error("Failed to remove product from cart");
      }
    }catch{
      console.log('Catch Block, failed to remove product from cart')
      toastService.error("Failed to remove product from cart - Please Login")
    }

  };

  // Show loading state
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }

  // Show 404 state
  if (notFound) {
    return (
      <div className="container text-center mt-5">
        <h1 className="display-1 text-muted">404</h1>
        <h2 className="mb-4">Product Not Found</h2>
        <p className="lead mb-4">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          Browse Other Products
        </Link>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger mb-4">Error Loading Product</h2>
        <p className="lead mb-4">{error}</p>
        <button 
          className="btn btn-primary me-2" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
        <Link to="/" className="btn btn-secondary">
          Browse Other Products
        </Link>
      </div>
    );
  }

  // If product data hasn't loaded yet, display a loading message.
  if (!product) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-warning mb-4">Product Not Available</h2>
        <p className="lead mb-4">
          Unable to load product details. Please try again later.
        </p>
        <button 
          className="btn btn-primary me-2" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
        <Link to="/" className="btn btn-secondary">
          Browse Other Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="ml-3 mt-3">{product.productname}</h1>
      <Container>
        <Row className="text-center">
          <Col md={6}>
            <Image
              className="mt-5"
              src={`data:image/jpeg;base64,${product.image}`}
              alt={product.productname}
              fluid
            />
          </Col>
          <Col md={6}>
            <h5 className="mb-5">{product.productdescription}</h5>
            <h6 className="mb-5">
              <Link to={`/user/${product.user_id}`}>By: {product.username}</Link>
            </h6>
            <h6 className="mb-5">Price: ${product.price}.00</h6>
            <Button variant="primary" className="mb-3" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <br />
            <Button variant="secondary" className="mb-3" onClick={handleRemoveFromCart}>
              Remove From Cart
            </Button>
            <br />
            <Button as={Link} to="/cart" variant="info">
              View Cart
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <Container className="mt-5">
          <h3 className="text-center mb-4">Related Products</h3>
          <Row className="text-center">
            {relatedProducts.map(relatedProduct => (
              <Col md={3} key={relatedProduct.productid} className="mb-3">
                {relatedProduct.image && (
                  <Image
                    src={`data:image/jpeg;base64,${relatedProduct.image}`}
                    alt={relatedProduct.productname}
                    fluid
                    className="mb-2"
                  />
                )}
                <Button
                  variant="outline-primary"
                  href={`/product/${relatedProduct.productid}`}
                  size="sm"
                >
                  {relatedProduct.productname}
                </Button>
                <p className="mt-2">${relatedProduct.price}.00</p>
              </Col>
            ))}
          </Row>
        </Container>
      )}
    </>
  );
};

export default ProductDetail;
