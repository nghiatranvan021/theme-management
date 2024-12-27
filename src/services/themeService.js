import axiosInstance from '../config/axios';

export const themeService = {
    // Get all themes for a shop
    getThemes: async (shopId,app_handle) => {
        try {
            const response = await axiosInstance.get(`/operation/themes`, {
                params: {
                    shop_id: shopId,
                    app_handle:app_handle
                }
            });

            return {
                status: response.status,
                themes: response.themes ?? [],
            };
        } catch (error) {

            throw error;
        }
    },

    // Get all files for a theme
    getThemeFiles: async (shopId, themeId, appHandle) => {
        try {
            const response = await axiosInstance.get(`/operation/theme/files`, {
                params: {
                    shop_id: shopId,
                    theme_id: themeId,
                    app_handle:appHandle
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get content of a specific file
    getFileContent: async (shopId, themeId, filename, appHandle) => {
        try {
            const response = await axiosInstance.get(`/operation/theme/file/content`, {
                params: {
                    shop_id: shopId,
                    theme_id: themeId,
                    file_name: filename,
                    app_handle:appHandle
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    async saveFile(shopId, themeId, filename, content, appHandle) {
        try {
            const response = await axiosInstance.post(`/operation/theme/file/content`, {
                shop_id: shopId,
                theme_id: themeId,
                file_name: filename,
                content,
                app_handle:appHandle
            });

            return response;
        } catch (error) {

            throw error;
        }
    }
}; 