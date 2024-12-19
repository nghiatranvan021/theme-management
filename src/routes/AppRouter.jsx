import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ThemeManager from '../pages/ThemeManager';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/theme/:shopId" element={<ThemeManager />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 