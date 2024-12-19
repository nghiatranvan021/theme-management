import React from 'react';

const ShopTable = () => {
  const shops = [
    {
      id: 1,
      name: 'Fashion Store',
      domain: 'fashion-store.com',
      status: 'Active',
      owner: 'John Doe',
      createdDate: '2024-03-15'
    },
    {
      id: 2,
      name: 'Electronics Hub',
      domain: 'electronics-hub.com',
      status: 'Inactive',
      owner: 'Jane Smith',
      createdDate: '2024-03-14'
    },
    {
      id: 3,
      name: 'Home Decor',
      domain: 'homedecor.com',
      status: 'Active',
      owner: 'Mike Johnson',
      createdDate: '2024-03-13'
    }
  ];

  return (
    <div className="shop-table-container">
      <table className="shop-table">
        <thead>
          <tr>
            <th>Shop Name</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shops.map((shop) => (
            <tr key={shop.id}>
              <td>{shop.name}</td>
              <td>{shop.domain}</td>
              <td>
                <span className={`status-badge ${shop.status.toLowerCase()}`}>
                  {shop.status}
                </span>
              </td>
              <td>{shop.owner}</td>
              <td>{new Date(shop.createdDate).toLocaleDateString()}</td>
              <td className="actions">
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShopTable; 