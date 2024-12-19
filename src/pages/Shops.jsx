import React from 'react';
import MainLayout from '../layouts/MainLayout';
import ShopTable from '../components/ShopTable';

const Shops = () => {
  return (
    <MainLayout>
      <div className="shops-page">
        <ShopTable />
      </div>
    </MainLayout>
  );
};

export default Shops; 