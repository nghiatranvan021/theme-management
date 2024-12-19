import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { Input, Select } from 'antd';
import { debounce } from 'lodash';
import { FaEdit, FaSignInAlt } from 'react-icons/fa';
const { Search } = Input;

const FilterSection = React.memo(({ 
  searchValue, 
  onSearchChange, 
  appPlanValue,
  shopifyPlanValue,
  handleFilterChange 
}) => (
  <div className="filter-section">
    <Input
      placeholder="Search shops..."
      value={searchValue}
      onChange={e => onSearchChange(e.target.value)}
      allowClear
      style={{ width: 200, marginRight: 16 }}
    />
    <Select
      placeholder="App Plan"
      onChange={(value) => handleFilterChange('app_plan', value)}
      style={{ width: 150, marginRight: 16 }}
      allowClear
      value={appPlanValue}
    >
      <Select.Option value="free">Free</Select.Option>
      <Select.Option value="pro">Pro</Select.Option>
    </Select>
    <Select
      placeholder="Shopify Plan"
      onChange={(value) => handleFilterChange('shopify_plan', value)}
      style={{ width: 150 }}
      allowClear
      value={shopifyPlanValue}
    >
      <Select.Option value="starter">Starter</Select.Option>
      <Select.Option value="basic">Basic</Select.Option>
      <Select.Option value="shopify">Shopify</Select.Option>
      <Select.Option value="advanced">Advanced</Select.Option>
      <Select.Option value="plus">Shopify Plus</Select.Option>
    </Select>
  </div>
));

const ShopTableRow = ({ shop }) => {
  const handleLogin = async () => {
    try {
      const { status, token, shop_domain } = await shopService.generateLoginToken(
        shop.shop_id,
        shop.email
      );
      
      if (!status || !token) {
        throw new Error('Failed to generate login token');
      }

      const fullUrl = process.env.REACT_APP_FE_URL;
      
      const loginUrl = new URL(fullUrl);
      loginUrl.searchParams.append('force_redirect', '1');
      loginUrl.searchParams.append('shop', shop_domain);
      loginUrl.searchParams.append('host', btoa(`${shop_domain}/admin`));
      loginUrl.searchParams.append('cs_session_token', token);
      
      window.open(loginUrl.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <tr>
      <td>{shop.shop_id}</td>
      <td>{shop.shop_name}</td>
      <td>
        <a href={`https://${shop.raw_domain}`} target="_blank" rel="noreferrer">
          {shop.raw_domain}
        </a>
      </td>
      <td>{shop.app_plan}</td>
      <td>
        <span className={`status-badge ${shop.shopify_plan.toLowerCase()}`}>
          {shop.shopify_plan}
        </span>
      </td>
      <td>{shop.email}</td>
      <td className="actions">
        <div className="action-buttons">
          <Link 
            to={`/theme/${shop.shop_id}`} 
            className="action-btn edit-theme-btn" 
            title="Edit Theme"
          >
            <FaEdit />
          </Link>
          <button 
            onClick={handleLogin} 
            className="action-btn login-btn" 
            title="Login"
          >
            <FaSignInAlt />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ShopTable = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page_token: undefined,
    shop_id: undefined,
    raw_domain: undefined,
    email: undefined,
    app_plan: undefined,
    shopify_plan: undefined,
    q: undefined
  });

  const [pageToken, setPageToken] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const [appPlanValue, setAppPlanValue] = useState();
  const [shopifyPlanValue, setShopifyPlanValue] = useState();

  const debouncedSearch = React.useMemo(
    () => 
      debounce((value) => {
        handleSearch(value);
      }, 500),
    []
  );

  const handleSearchChange = React.useCallback((value) => {
    setSearchValue(value);
    debouncedSearch(value);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  useEffect(() => {
    const getShops = async () => {
      try {
        setLoading(true);
        const {status,shops,next_page_token} = await shopService.getShops(filters);
        if (!status) {
          throw new Error('Failed to fetch shops');
        }

        setShops(shops ?? []);
        setPageToken(next_page_token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getShops();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    if (key === 'app_plan') setAppPlanValue(value);
    if (key === 'shopify_plan') setShopifyPlanValue(value);
    
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (value) => {
    console.log('Search value:', value);
    setFilters(prev => ({
      ...prev,
      q: value || undefined
    }));
  };

  const handleLoadMore = async () => {
    if (loading || !pageToken) return;

    setLoading(true);
    try {
      const {status, shops: newShops, next_page_token} = await shopService.getShops({
        ...filters,
        page_token: pageToken
      });

      if (!status) {
        throw new Error('Failed to fetch more shops');
      }

      setShops(prevShops => [...prevShops, ...(newShops || [])]);
      setPageToken(next_page_token);
    } catch (err) {
      console.error('Error loading more shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const tableHeaders = [
    { id: 'shopId', label: '#Shop ID' },
    { id: 'name', label: 'Shop Name' },
    { id: 'domain', label: 'Domain' },
    { id: 'appPlan', label: 'App Plan' },
    { id: 'shopifyPlan', label: 'Shopify Plan' },
    { id: 'email', label: 'Email' },
    { id: 'actions', label: 'Actions' }
  ];

  const tableRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && pageToken && !loading) {
        handleLoadMore();
      }
    }, options);

    const sentinel = document.querySelector('#sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [pageToken, loading]);

  return (
    <div className="shop-table-container">
      <FilterSection 
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        appPlanValue={appPlanValue}
        shopifyPlanValue={shopifyPlanValue}
        handleFilterChange={handleFilterChange}
      />
      
      <div className="table-wrapper" ref={tableRef}>
        <table className="shop-table">
          <thead>
            <tr>
              {tableHeaders.map(header => (
                <th key={header.id}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && shops.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length}>
                  <div className="no-results">
                    No shops found
                  </div>
                </td>
              </tr>
            ) : (
              shops.map((shop) => (
                <ShopTableRow key={shop.shop_id} shop={shop} />
              ))
            )}
          </tbody>
        </table>

        {pageToken && !loading && shops.length > 0 && (
          <div id="sentinel" style={{ height: '10px', margin: '20px 0' }} />
        )}
        
        {loading && (
          <div className="loading-indicator">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default ShopTable; 