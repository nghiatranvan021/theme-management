import mongoose, { Document, Schema } from 'mongoose';
import {config} from "../config/config.js";
import {logger} from '../utils/logger.js';

interface IAuth extends Document {
  shop_id: number;
  access_token: string;
  created_at: Date;
  myshopify_domain: string;
  scope: string;
  uninstalled_at?: Date;
  installed_at: Date;
  is_active: boolean;
  updated_at: Date;
  is_reinstalled: boolean;
  reinstalled_at?: Date;
}

const authConnection = mongoose.createConnection(config.mongodb.url as string, {
  dbName: 'ar_auth',
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10
});

authConnection.on('connected', () => {
  logger.info('MongoDB connected successfully to ar_auth database');
});

authConnection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

authConnection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await authConnection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
});


const AuthSchema: Schema = new Schema({
  shop_id: {
    type: Number,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  myshopify_domain: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
  uninstalled_at: {
    type: Date,
    default: null,
  },
  installed_at: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  is_reinstalled: {
    type: Boolean,
    default: false,
  },
  reinstalled_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'shop'
});

const AuthModel = authConnection.model<IAuth>('shop', AuthSchema);

export default AuthModel;

