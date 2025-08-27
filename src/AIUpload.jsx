import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const AIUpload = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [price, setPrice] = useState('');
  const [showFields, setShowFields] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const userId = props.id; // User ID passed from App.jsx
  const user = props; // User object passed from App.jsx

  // Handle file input change: update preview and send file for processing.
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);              //Should trigger a rerender of our component

    // Create preview using FileReader.
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Prepare form data for uploading.
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send file to the backend endpoint for AI processing.
      const response = await axios.post(`http://127.0.0.1:5000/upload/aiprocess`, formData, {withCredentials: true});
      console.log("From AIUpload.jsx - The response we got back was ", response);
      // Populate product fields with the response data.
      setProductTitle(response.data.title || '');
      setProductDesc(response.data.description || '');
      setShowFields(true);
    } catch (error) {
      console.error('AI Processing failed:', error);
    }
  };

  // Handling final form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add form data
    const data = new FormData();
    data.append('productName', productTitle);
    data.append('productDescription', productDesc);
    data.append('productPrice', price);
    if (selectedFile) {
      data.append('productImage', selectedFile);
    }
    axios
      .post(`http://127.0.0.1:5000/upload/${userId}`, data, {withCredentials: true})
      .then(response => {
        // Refresh the product list after successful upload or update error fields if we got any.
        console.log("From AIUpload.jsx - The response we got back was ", response);
        navigate('/userdetail', {replace: true});
      })
      .catch(err => {   // We'll get a HTTP 400 if any fields are missing. From there we'll set error messages from the API.
        console.error('Error uploading product:', err);
        setErrors(err.response.data.error);
      });
  };

  return (
    <div className="container">
      <h1 className="text-center mt-3 mb-5">Use AI to Describe Your Product</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group text-center">
          <h2 className="mt-5 mb-5 text-primary">Upload a Picture</h2>
          <input
            id="upload-file"
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {imagePreview && (
          <div className="d-flex justify-content-center align-items-center mt-3">
            <img
              className="img-fluid"
              src={imagePreview}
              alt="Image Preview"
              style={{ maxWidth: '300px', maxHeight: '300px' }}
            />
          </div>
        )}

        {showFields && (
          <>
            <div className="form-group mt-3">
              <label htmlFor="product-title" className="btn btn-primary">
                Product Name
              </label>
              <input
                type="text"
                id="product-title"
                className="form-control product-field"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
              />
            {errors.productName && <span className = 'text-primary float-right'>{errors.productName}</span>}
            </div>

            <div className="form-group mt-3">
              <label htmlFor="product-desc" className="btn btn-primary">
                Product Description
              </label>
              <textarea
                id="product-desc"
                className="form-control product-field"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
              />
            {errors.productDescription && <span className = 'text-primary float-right'>{errors.productDescription}</span>}
            </div>

            <div className="form-group mt-3">
              <label htmlFor="product-price" className="btn btn-primary">
                Product Price
              </label>
              <input
                type="text"
                id="product-price"
                className="form-control product-field"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            {errors.productPrice && <span className = 'text-primary float-right'>{errors.productPrice}</span>}
            </div>

            <div className="text-center">
              <button id="submit-btn" type="submit" className="btn btn-primary mt-2">
                Confirm?
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AIUpload;
