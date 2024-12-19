import React from 'react';
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <div className="home-page">
        <h1>Welcome to Theme Management</h1>
        <p>
          A modern solution for managing your application themes with ease. 
          Customize your experience with our intuitive theme management system.
        </p>
      </div>
    </MainLayout>
  );
};

export default Home; 