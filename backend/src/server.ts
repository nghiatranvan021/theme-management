import app from './app.js';
import { logger } from './utils/logger.js';
import { config } from './config/config.js';

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
