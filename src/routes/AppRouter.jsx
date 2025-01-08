import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import ThemeManager from '../pages/ThemeManager';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/theme/:shopId" element={<ThemeManager />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 