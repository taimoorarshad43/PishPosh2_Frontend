// API Configuration
export const API_BASE_URL = 'https://pishposh2-backend.onrender.com';

// Common API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
  ME: '/@me',
  
  // Products
  PRODUCT_IMAGES: '/v1/productimages',
  PRODUCT_IMAGE: '/v1/productsimages',
  PRODUCT_RELATED: '/product',
  PRODUCT_ADD_TO_CART: '/product',
  PRODUCT_REMOVE_FROM_CART: '/product',
  
  // Cart
  CART: '/cart',
  CART_CLEAR_ALL: '/cart/clearall',
  
  // Users
  USERS: '/v1/users',
  
  // Upload
  UPLOAD: '/upload',
  AI_PROCESS: '/upload/aiprocess',
  
  // Stripe
  STRIPE_KEY: '/stripe_key'
};
