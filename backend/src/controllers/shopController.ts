import {Request, Response} from 'express';
import {Shop} from '../models/Shop';
import jwt from 'jsonwebtoken';
import {config} from '../config/config';
import Auth from "../models/auth";
import {findAll, findByShopId} from "../models/mysql/Shop";

export const shopController = {
    // Get shops with filters
    getShops: async (req: Request, res: Response) => {
        const appHandle = req.query.app_handle ?? 'go'
        if (appHandle === 'go') {
            return shopController.getListShopsGo(req, res);
        }

        return shopController.getListShopsPhp(req, res);
    },

    getListShopsGo: async (req: Request, res: Response) => {
        try {
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

            const shopIDs = shops.map(shop => shop.shop_id);

            // Get status of each shop
            const statuses = await shopController.getStatusByShopIDs(shopIDs);
            shops.forEach(shop => {
                const status = statuses.find(status => status.shop_id === shop.shop_id);
                shop.is_active = status?.status;
            });


            res.json({
                status: true,
                shops: shopController.convertToShops(shops),
                next_page_token: shops.length === limit ? shops[shops.length - 1]._id : null
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to fetch shops',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },
    getListShopsPhp: async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const page_token = req.query.page_token as string;
            const query = req.query.q as string;
            const app_plan = req.query.app_plan as string;
            const shopify_plan = req.query.shopify_plan as string;

            const {shops, nextCursor} = await findAll({
                limit,
                cursor: page_token,
                query,
                app_plan,
                plan_name: shopify_plan
            });
            res.json({
                status: true,
                shops: shopController.convertToShops(shops),
                next_page_token: nextCursor
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
            const {shop_id, email, role, app_handle} = req.body;
            // Verify shop and email exist
            const shop = await shopController.getShop(shop_id, app_handle);
            if (!shop) {
                res.status(404).json({error: 'Shop or email not found'});
                return;
            }

            // Generate token with all required fields
            const token = jwt.sign(
                {
                    iss: `https://${shop.Domain}/admin`, // Issuer
                    dest: `https://${shop.Domain}`, // Destination URL
                    aud: config.client_id, // Audience
                    sub: shop_id, // Subject (shop ID)
                    exp: Math.floor(Date.now() / 1000) + config.jwt.expiresIn, // Expiration time (in seconds)
                    nbf: Math.floor(Date.now() / 1000), // Not Before
                    iat: Math.floor(Date.now() / 1000) // Issued At
                },
                config.client_secret // Secret key for signing the token
            );

            res.json({status: true, token: token, shop_domain: shop.Domain});
        } catch (error) {
            res.status(500).json({
                error: 'Failed to generate token',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    getStatusByShopIDs: async (shopIDs: number[]) => {
        try {
            const shops = await Auth.find({shop_id: {$in: shopIDs}});
            return shops.map(shop => ({
                shop_id: shop.shop_id,
                status: shop.is_active ?? false
            }));
        } catch (error) {
            return [];
        }
    },
    // support for golang and php
    convertToShops: (shops: any[]): any[] => {
        return shops.map(shop => ({
            shop_id: shop.shop_id,
            domain: shop.domain || shop.myshopify_domain,
            shop_name: shop.shop_name || shop.name,
            shop_owner: shop.shop_owner,
            email: shop.shop_email || shop.email,
            phone: shop.shop_phone || shop.phone,
            country_code: shop.shop_country || shop.country_code,
            currency: shop.currency,
            money_format: shop.money_format,
            timezone: shop.shop_timezone || shop.iana_timezone,
            plan_name: shop.plan_name,
            app_plan: shop.app_plan,
            created_at: shop.created_at,
            updated_at: shop.updated_at,
            is_active: shop.shop_status === 1 || shop.is_active || false,
            primary_locale: shop.primary_locale
        }));
    },
    getShop: async (shopId: number, appHandle?: string) => {
        if (appHandle === 'go') {
            const shop = await Shop.findOne({shop_id:shopId});
            if (!shop) {
                return null;
            }

            return {
                ShopId: shop.shop_id,
                Domain: shop.myshopify_domain
            };
        }

        const shop = await findByShopId(shopId);
        if (!shop) {
            return null;
        }

        return {
            ShopId: shop.shop_id,
            Domain: shop.shop_name
        };
    }
}; 