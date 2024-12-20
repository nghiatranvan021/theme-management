import {Request, Response} from 'express';
import {Shop} from '../models/Shop';
import jwt from 'jsonwebtoken';
import {config} from '../config/config';

export const shopController = {
    // Get shops with filters
    getShops: async (req: Request, res: Response) => {
        try {
            const filters = req.query;
            const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items
            const page_token = req.query.page_token as string || "";
            const query = req.query.q as string || "";
            const app_plan = req.query.app_plan as string || "";
            const shopify_plan = req.query.shopify_plan as string || "";

            // Convert query params to a MongoDB filter object
            const mongoFilters: any = {};
            // Apply pagination
            if (page_token) {
                mongoFilters._id = {$gt: page_token};
            }
            // Apply search query
            if (query) {
                mongoFilters.$or = [
                    {myshopify_domain: {$regex: query, $options: 'i'}}
                ];
            }
            // Apply app plan filter
            if (app_plan) {
                mongoFilters.app_plan = app_plan;
            }
            // Apply Shopify plan filter
            if (shopify_plan) {
                mongoFilters.plan_name = shopify_plan;
            }

            const shops = await Shop.find(mongoFilters).limit(limit).sort({_id: 1});
            res.json({
                status: true,
                shops: shops,
                next_page_token: shops.length === limit ? shops[shops.length - 1]._id : null
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to fetch shops',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    // Generate login token
    generateLoginToken: async (req: Request, res: Response) => {
        try {
            const {shop_id, email, role} = req.body;

            // Verify shop and email exist
            const shop = await Shop.findOne({shop_id});
            if (!shop) {
                res.status(404).json({error: 'Shop or email not found'});
                return;
            }

            // Generate token with all required fields
            const token = jwt.sign(
                {
                    iss: `https://${shop.myshopify_domain}/admin`, // Issuer
                    dest: `https://${shop.myshopify_domain}`, // Destination URL
                    aud: config.client_id, // Audience
                    sub: shop_id, // Subject (shop ID)
                    exp: Math.floor(Date.now() / 1000) + config.jwt.expiresIn, // Expiration time (in seconds)
                    nbf: Math.floor(Date.now() / 1000), // Not Before
                    iat: Math.floor(Date.now() / 1000) // Issued At
                },
                config.client_secret // Secret key for signing the token
            );

            res.json({status:true,token: token,shop_domain:shop.myshopify_domain});
        } catch (error) {
            res.status(500).json({
                error: 'Failed to generate token',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
}; 