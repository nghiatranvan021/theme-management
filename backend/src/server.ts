import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from './app.js';
import { logger } from './utils/logger.js';
import { config } from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
