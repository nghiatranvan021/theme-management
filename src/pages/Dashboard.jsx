import React from 'react';
import MainLayout from '../layouts/MainLayout';
import ShopTable from '../components/ShopTable';

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="dashboard">
        <ShopTable />
      </div>
    </MainLayout>
  );
};

export default Dashboard; 