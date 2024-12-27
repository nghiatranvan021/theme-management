import {Request, Response} from 'express';
import {createThemeService} from "../services/shopifyService";
import Auth from "../models/auth";
import {decrypt} from "../utils/cryptor";
import {config} from "../config/config";
import {findByShopId} from "../models/mysql/Shop";

export const themeController = {
    // Get all themes for a shop
    getThemes: async (req: Request, res: Response) => {
        try {
            const {shop_id, app_handle} = req.query;
            if (!app_handle){
                res.status(400).json({status:false,error: 'Missing required parameters'});
                return
            }

            const {domain, access_token} = await themeController.getAccessToken(Number(shop_id), app_handle as string);
            if (!access_token) {
                res.status(404).json({status: false, error: 'Access token not found'});
                return
            }

            const service = createThemeService(domain, access_token);
            const result = await service.getThemes();
            if (!result) {
                throw new Error('Failed to fetch themes');
            }

            let themes = result.map((edge: any) =>{
                return {
                    id: Number(edge.node.id.replace('gid://shopify/OnlineStoreTheme/', '')),
                    name: edge.node.name,
                    role: edge.node.role,
                    createdAt: edge.node.createdAt,
                    updatedAt: edge.node.updatedAt,
                    processing: edge.node.processing,
                    processingFailed: edge.node.processingFailed
                }
            });

            res.json({status: true, themes: themes});
        } catch (error) {
            res.status(500).json({
                error: 'Failed to fetch themes',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    // Get all files for a theme
    getThemeFiles: async (req: Request, res: Response) => {
        const {shop_id, theme_id, app_handle} = req.query;
        if (!app_handle){
            res.status(400).json({status:false,error: 'Missing required parameters'});
            return
        }

        const {domain, access_token} = await themeController.getAccessToken(Number(shop_id), app_handle as string);
        if (!access_token) {
            res.status(404).json({status:false,error: 'Access token not found'});
            return
        }

        const service = createThemeService(domain, access_token);
        try {
            const files = await service.getAssets(Number(theme_id));
            if (!files) {
                throw new Error('Failed to fetch assets');
            }
            res.json({status: true, files: files});
        } catch (error) {
            console.error('Error fetching assets:', error);
            res.status(500).json({
                status: false,
                error: 'Failed to fetch theme files',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    // Get content of a specific file
    getFileContent: async (req: Request, res: Response) => {
        try {
            const {shop_id, theme_id, file_name, app_handle} = req.query;

            if (!shop_id || !theme_id || !file_name || !app_handle) {
                res.status(400).json({status:false,error: 'Missing required parameters'});
                return
            }

            const {domain, access_token} = await themeController.getAccessToken(Number(shop_id), app_handle as string);
            if (!access_token) {
                res.status(404).json({status:false,error: 'Access token not found'});
                return
            }

            const service = createThemeService(domain, access_token);

            const content = await service.findContent(Number(theme_id), file_name as string);
            res.json({status: true, content});
        } catch (error) {
            res.status(500).json({
                error: 'Failed to fetch file content',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    // Save file content
    saveFile: async (req: Request, res: Response) => {
        try {
            const {shop_id, theme_id, file_name, content, app_handle} = req.body;
            if (!app_handle){
                res.status(400).json({status:false,error: 'Missing required parameters'});
                return
            }

            const {domain, access_token} = await themeController.getAccessToken(Number(shop_id), app_handle);
            if (!access_token) {
                res.status(404).json({status:false,error: 'Access token not found'});
                return
            }

            const service = createThemeService(domain, access_token);
            const result = service.updateContent(Number(theme_id), file_name, content);

            res.json({status: true, result});

        } catch (error) {
            res.status(500).json({
                error: 'Failed to save file',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    getAccessToken: async (shopId: number, app_handle? :string) => {
        try {
            if (app_handle === 'go'){
                const auth = await Auth.findOne({
                    shop_id: Number(shopId)
                });

                if (!auth) {
                    return {}
                }

                if (!auth.access_token) {
                    return {}
                }

                return {
                    domain: auth.myshopify_domain,
                    access_token: decrypt(auth.access_token, config.token_key),
                }
            }

        const shop   = await findByShopId(shopId);
            if (!shop) {
                return {}
            }

            return {
                domain: shop.shop_name,
                access_token: shop.access_token
            }

        } catch (error) {
            console.log('Error fetching access token:', error);
            return {}
        }
    }
}; 