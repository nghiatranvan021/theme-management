import {Request, Response} from 'express';
import {Theme} from '../models/Theme';
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {createThemeService} from "../services/shopifyService";
import {Shop} from "../models/Shop";
import Auth from "../models/auth";
import {decrypt} from "../utils/cryptor";
import {config} from "../config/config";

export const themeController = {
    // Get all themes for a shop
    getThemes: async (req: Request, res: Response) => {
        try {
            const {shop_id} = req.query;
            const result = await Theme.findOne({shop_id});
            res.json({status: true, themes: result});
        } catch (error) {
            res.status(500).json({
                error: 'Failed to fetch themes',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    // Get all files for a theme
    getThemeFiles: async (req: Request, res: Response) => {
        const {shop_id, theme_id} = req.query;

        const auth = await Auth.findOne({
            shop_id: Number(shop_id)
        });

        if (!auth) {
            res.status(404).json({error: 'Auth not found'});
            return
        }
        const access_token = decrypt(auth.access_token, config.token_key);
        const service = createThemeService(auth.myshopify_domain, access_token);
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
            const {shop_id, theme_id, file_name} = req.query;

            if (!shop_id || !theme_id || !file_name) {
                res.status(400).json({error: 'Missing required parameters'});
                return
            }

            const auth = await Auth.findOne({
                shop_id: Number(shop_id)
            });

            if (!auth) {
                res.status(404).json({error: 'Auth not found'});
                return
            }
            const access_token = decrypt(auth.access_token, config.token_key);
            const service = createThemeService(auth.myshopify_domain, access_token);

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
            const {shop_id, theme_id, file_name, content} = req.body;


            const auth = await Auth.findOne({
                shop_id: Number(shop_id)
            });

            if (!auth) {
                res.status(404).json({error: 'Auth not found'});
                return
            }
            const access_token = decrypt(auth.access_token, config.token_key);
            const service = createThemeService(auth.myshopify_domain, access_token);
            const result = service.updateContent(Number(theme_id), file_name, content);

            res.json({status: true, result});

        } catch (error) {
            res.status(500).json({
                error: 'Failed to save file',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
}; 