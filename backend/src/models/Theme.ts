import mongoose from 'mongoose';
import {config} from "../config/config.js";
import {logger} from '../utils/logger.js';

const themeConnection = mongoose.createConnection(config.mongodb.url as string, {
  dbName: 'ar_widget',
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10
});

// Add connection event handlers
themeConnection.on('connected', () => {
  logger.info('MongoDB connected successfully to ar_widget database');
});

themeConnection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

themeConnection.on('disconnected', () => {
  logger.warn('MongoDB disconnected from ar_widget database');
});

// Handle process termination
process.on('SIGINT', async () => {
  await themeConnection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
});

const themeItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  theme_store_id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  previewable: {
    type: Boolean,
    default: true
  },
  processing: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['unpublished', 'main'],
    required: true
  },
  src: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    required: true
  },
  updated_at: {
    type: Date,
    required: true
  }
}, { _id: false });

const themeSchema = new mongoose.Schema({
  shop_id: {
    type: Number,
    required: true,
    unique: true
  },
  themes: [themeItemSchema],
  new_theme_id: {
    type: Number,
    required: true
  },
  old_theme_id: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

export const Theme = themeConnection.model('themes', themeSchema);