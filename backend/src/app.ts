import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import shopRoutes from './routes/shopRoutes.js';
import themeRoutes from './routes/themeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();

// CORS configuration
const corsOptions = {
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*'],
  credentials: true
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// API Routes first
app.use('/', shopRoutes);
app.use('/', themeRoutes);

// Static files serving with explicit mime types
app.get('*.js', (req, res, next) => {
  res.type('application/javascript');
  next();
});

app.get('*.css', (req, res, next) => {
  res.type('text/css');
  next();
});

// Serve static files
app.use('/', express.static(join(__dirname, '../../dist')));

// SPA fallback - must be last
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../dist/index.html'));
});

// Error handling
app.use(errorHandler);

export default app;
