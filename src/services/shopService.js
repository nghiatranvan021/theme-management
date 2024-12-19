import axiosInstance from '../config/axios';

export const shopService = {
    getShops: async (filters) => {
        try {
            console.log('Fetching shops with filters:', filters);
            const response = await axiosInstance.get('/operation/shops', {
                params: filters
            });
            return response;
        } catch (error) {
            console.error('Error in getShops:', {
                filters,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },
    generateLoginToken: async (shopId, email, role = 'admin') => {
        try {
            const response = await axiosInstance.post('/operation/cs-token', {
                shop_id: shopId,
                email: email,
                role: role
            });
            return response;
        } catch (error) {
            console.error('Error generating login token:', error);
            throw error;
        }
    }
}