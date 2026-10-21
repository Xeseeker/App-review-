require('dotenv').config();
const { requireEnvironment } = require('./config/env');

try {
  requireEnvironment();
  const app = require('./app');
  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => console.log(`Appora API listening on http://localhost:${port}`));
} catch (error) {
  console.error(`Appora API could not start: ${error.message}`);
  process.exit(1);
}
