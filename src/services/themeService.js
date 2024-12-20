import axiosInstance from '../config/axios';

export const themeService = {
    // Get all themes for a shop
    getThemes: async (shopId) => {
        try {
            console.log(`Fetching themes for shop ${shopId}`);
            const response = await axiosInstance.get(`/operation/themes`, {
                params: {
                    shop_id: shopId
                }
            });

            return {
                status: response.status,
                themes: response.themes.themes ?? [],
            };
        } catch (error) {
            console.error('Error in getThemes:', {
                shopId,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    // Get all files for a theme
    getThemeFiles: async (shopId, themeId) => {
        try {
            const response = await axiosInstance.get(`/operation/theme/files`, {
                params: {
                    shop_id: shopId,
                    theme_id: themeId,
                }
            });
            return response;
        } catch (error) {
            console.error('Error in getThemeFiles:', error);
            throw error;
        }
    },

    // Get content of a specific file
    getFileContent: async (shopId, themeId, fileName) => {
        try {
            const response = await axiosInstance.get(`/operation/theme/file/content`, {
                params: {
                    shop_id: shopId,
                    theme_id: themeId,
                    file_name: fileName
                }
            });
            return response;
        } catch (error) {
            console.error('Error in getFileContent:', error);
            throw error;
        }
    },

    async saveFile(shopId, themeId, fileName, content) {
        try {
            const response = await axiosInstance.post(`/operation/theme/file/content`, {
                shop_id: shopId,
                theme_id: themeId,
                file_name: fileName,
                content
            });

            return response;
        } catch (error) {
            console.error('Error in saveFile:', {
                shopId,
                themeId,
                fileName,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }
}; 