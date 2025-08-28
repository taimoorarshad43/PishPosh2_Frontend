// CheckoutComponent.js
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Container, Row, Col, Badge, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config/api.js';

const CheckoutComponent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [products, setProducts] = useState([]);

  // Get product data from cart endpoint and set products
  useEffect(() => {
    const getProducts = async () => {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CART}`, { withCredentials: true });
      const data = await response.data;
      console.log("From CheckoutComponent.jsx - the data is", data);
        if(data){
          setProducts(data);
        }else{
          console.error('Error fetching cart data');
        }
      }
    
    getProducts();
  }, []);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    // We then want to clear the cart via this endpoint
    axios.post(`${API_BASE_URL}${API_ENDPOINTS.CART_CLEAR_ALL}`, {}, {withCredentials: true})
    .then(response => {console.log("From CheckoutComponent.jsx - The response we got back was ", response);})
    .catch(error => {console.log("From CheckoutComponent.jsx - The error we got back was ", error);})

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Replace with your actual return URL.
        return_url: `${window.location.origin}/confirmation`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }
    // On success, Stripe will redirect to the return_url.
  };

  return (
    <div className="container">
      <div className="mt-5 row text-center">
        <div className="col-8">
      {products && Object.keys(products).length > 1 ? ( // products object from backend will always at least have a subtotal key
        <>
          <Row className="text-center">
            <Col md={8}>
              {Object.values(products).map(product => ( // loop through the product dictionary's values and go from there
                <div key={product.productid} className="mt-5">
                  {product.image && (
                    <>
                      <Image
                        src={`data:image/jpeg;base64,${product.image}`}
                        alt={product.productname}
                        fluid
                      />
                      <br />
                      <Link to={`/product/${product.productid}`}>
                        {product.productname}
                      </Link>
                      <span className="ml-3">
                        <Badge variant="primary">
                          Price: ${product.price}.00
                        </Badge>
                      </span>
                    </>
                  )}
                </div>
              ))}
              <Badge pill variant="primary">
                Subtotal: ${products.cart_subtotal}.00
              </Badge>
            </Col>
          </Row>
          <Row className="text-center">
            <Col className="mt-5">
              <Button variant="info" as={Link} to="/checkout">
                Checkout
              </Button>
            </Col>
          </Row>
        </>
      ) : (                                                           // If nothing in cart, then we have this message
        <h4 className="display-4 text-center">Nothing in Cart</h4>
      )}
        </div>
        <div className="col-4">
          <form id="payment-form" onSubmit={handleSubmit}>
            {/* Render Stripe's Payment Element */}
            <PaymentElement id="payment-element" />
            <button type="submit" className="mt-4 btn btn-primary" disabled={!stripe}>
              Submit
            </button>
            <a href="/cart" className="mt-4 btn btn-secondary">
              Cancel
            </a>
          </form>
          {errorMessage && (
            <div className="text-danger text-center" id="error-message">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutComponent;
