import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import shopRoutes from './routes/shopRoutes.js';
import themeRoutes from './routes/themeRoutes.js';

const app: Express = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
} else {
  app.use(helmet());
}
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/', shopRoutes);
app.use('/', themeRoutes);

// Error handling
app.use(errorHandler);

export default app;
