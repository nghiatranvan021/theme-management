import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Shops from '../pages/Shops';
import ThemeManager from '../pages/ThemeManager';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/theme/:shopId" element={<ThemeManager />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 