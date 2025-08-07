import { config } from './config/env';
import app from './server';

app.listen(config.port, () => {
  console.info(`Server running on http://localhost:${config.port}`);
});
