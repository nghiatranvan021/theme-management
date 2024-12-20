import mongoose from 'mongoose';
import {config} from "../config/config";
import {logger} from '../utils/logger.js';

const shopConnection = mongoose.createConnection(config.mongodb.url as string, {
  dbName: 'ar_shop',
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10
});

shopConnection.on('connected', () => {
  logger.info('MongoDB connected successfully to ar_shop database');
});

shopConnection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

shopConnection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await shopConnection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
});

const shopSchema = new mongoose.Schema({
  shop_id: {
    type: Number,
    required: true,
    unique: true
  },
  country_code: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  iana_timezone: {
    type: String,
    required: true
  },
  money_format: {
    type: String,
    required: true
  },
  myshopify_domain: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  plan_name: {
    type: String,
    required: true
  },
  shop_owner: {
    type: String,
    required: true
  },
  updated_at: {
    type: Date,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  primary_locale: {
    type: String,
    required: true
  },
  app_plan: {
    type: String,
    required: true
  }
}, {
  timestamps: true, // This will handle created_at and updated_at
  versionKey: false, // This removes the __v field
  collection: 'shop'
});

export const Shop = shopConnection.model('shop', shopSchema); 