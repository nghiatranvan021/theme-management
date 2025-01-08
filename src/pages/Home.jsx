import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  const navigate = useNavigate();
  const [shopIdentifier, setShopIdentifier] = useState('');
  const [appHandle, setAppHandle] = useState('go');

  const handleSubmit = async () => {
    // Validate input
    if (!shopIdentifier.trim()) {
      alert('Please enter a Shop ID or Shopify Domain');
      return;
    }

    // console.log('Connecting to shop:', shopIdentifier, 'with app:', appHandle);

    // Navigate to the theme page with app handle
    navigate(`/theme/${shopIdentifier}?app_handle=${appHandle}`);
  };

  return (
    <MainLayout>
      <div className="home-page">
        <div className="logo-container">
          <img 
            src="/logo.svg" 
            alt="Theme Management Logo" 
            className="logo"
          />
        </div>
        <h1>Theme Management</h1>

        <div className="shop-input-section">
          <input
            type="text"
            placeholder="Enter Shop ID"
            className="shop-input"
            value={shopIdentifier}
            onChange={(e) => setShopIdentifier(e.target.value)}
          />
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="appHandle"
                value="go"
                checked={appHandle === 'go'}
                onChange={(e) => setAppHandle(e.target.value)}
              />
              <span className="radio-custom"></span>
              Go
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="appHandle"
                value="php"
                checked={appHandle === 'php'}
                onChange={(e) => setAppHandle(e.target.value)}
              />
              <span className="radio-custom"></span>
              PHP
            </label>
          </div>
          <button className="submit-button" onClick={handleSubmit}>
            Edit Theme
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home; 