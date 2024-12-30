import express from 'express';
import { themeController } from '../controllers/themeController.js';

const router = express.Router();

router.get('/operation/themes', themeController.getThemes);
router.get('/operation/theme/files', themeController.getThemeFiles);
router.get('/operation/theme/file/content', themeController.getFileContent);
router.post('/operation/theme/file/content', themeController.saveFile);

export default router; 