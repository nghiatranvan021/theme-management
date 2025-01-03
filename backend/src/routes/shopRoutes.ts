import express from 'express';
import { shopController } from '../controllers/shopController.js';

const router = express.Router();

router.get('/operation/shops', shopController.getShops);
router.post('/operation/cs-token', shopController.generateLoginToken);


export default router; 