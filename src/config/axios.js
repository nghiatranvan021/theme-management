import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = process.env.REACT_APP_API_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        url: error.config.url,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('API No Response:', {
        url: error.config.url,
        request: error.request
      });
    } else {
      console.error('API Request Config Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 