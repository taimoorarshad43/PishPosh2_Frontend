import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from './config/api.js';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import toastService from './services/toastservice';

import IndexPage from './Index'
import Signup from './Signup'
import Login from './Login'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import UserDetail from './UserDetail'
import User from './User'
import AIUpload from './AIUpload'
import CheckoutComponent from './CheckoutComponent';
import PaymentConfirmation from './PaymentConfirmation';
import NotFound from './NotFound';
import { useUser } from "./services/UserContext";

const stripePromise = loadStripe('pk_test_51QIZ5VGS3ixkvINIJUDHhSJtcl3I5rpMFX4JEt228TH9Mw5vtM3yXryMfcnnOisTAt7rslzRbZDdBcPcxyIruU5400GeH1HxJH');
// Loading stripe public key outside App component to avoid reinitializing it on every render



/* Only use useEffect if theres a logout* */

function App() {
  const { user, logout } = useUser();
  const [clientSecret, setClientSecret] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // To prevent a race condition with logging in and logging out functionality DEPRECATE

  // Will use this to get the client secret from the backend and pass to CheckoutComponent
  useEffect(() => {
    axios.post(`${API_BASE_URL}${API_ENDPOINTS.STRIPE_KEY}`, {}, {withCredentials: true})
      .then(response => {
        setClientSecret(response.data);
      });
  }, []);

  // Remove user state and getUser logic, as user is now managed by context
  // Will use this to logout the user - no need for a dedicated component
  const logoutUser = async () => {
    setIsLoggingOut(true); // Set logging out state to true
    await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {}, {withCredentials: true});
    logout();
    toastService.info("Logged out!")
    // console.log('From App.jsx - Logging out');
    navigate('/', {replace: true});
  }

  // This will be used to check if the user is logged in or not
  useEffect(() => {
    if(user){
      setIsLoggingOut(false); // Reset logging out state
    }
  }, [user]);

  // console.log("From App.jsx - The userid we got back was ", user);
  // console.log("From App.jsx - The location was ", location);

  return (
    <div className = "App">
        <Navbar bg="primary" variant="light" className="justify-content-between">
          <Container>
            <Navbar.Brand as={Link} to="/" className = "text-light">PishPosh</Navbar.Brand>
            <Nav className="ms-auto">
              {user ? (
                <>
                  <Nav.Link as={Link} to="/cart" className = "text-light">View Cart</Nav.Link>
                  <Nav.Link as={Link} to="/userdetail" className = "text-light">View Profile</Nav.Link>
                  <Nav.Link as={Link} onClick={logoutUser} className="text-light">Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className = "text-light">Login</Nav.Link>
                  <Nav.Link as={Link} to="/signup" className = "text-light">Sign Up</Nav.Link>
                </>
              )}
            </Nav>
          </Container>
        </Navbar>
        <Routes>
          <Route path = "/" element = {<IndexPage/>}></Route>
          <Route path = "/login" element = {<Login/>}></Route>
          <Route path = "/signup" element = {<Signup/>}></Route>
          <Route path = "/cart" element = {<Cart {...user}/>}></Route>
          <Route path = "/product/:productid" element = {<ProductDetail/>}></Route>
          <Route path = "/user/:userid" element = {<User/>}></Route>
          <Route path = "/userdetail" element = {<UserDetail {...user} />}></Route>
          <Route path = "/upload/:userid/ai" element = {<AIUpload {...user} />}></Route>

          {/*Stripe Component*/}
          <Route path="/checkout" element={
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutComponent/>
            </Elements>}/>
          <Route path = "/confirmation" element = {<PaymentConfirmation/>}></Route>

          {/* 404 Route at end with catch all path */}
          <Route path="*" element={<NotFound />} />

        </Routes>
        {/*Toast Service Component*/}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
    </div>
  )
}

export default App;
