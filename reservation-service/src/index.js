const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const messageRoutes = require('./routes/messages');
const { checkRequiredFiles, checkEnvironment } = require('./utils/startup-check');

dotenv.config();

async function startServer() {
  try {
    await checkRequiredFiles();
    checkEnvironment();

    const app = express();
    const PORT = process.env.PORT;  // Will be set by startup check

    app.use(cors());
    app.use(express.json());

    // Ensure all responses are JSON
    app.use((req, res, next) => {
      res.setHeader('Content-Type', 'application/json');
      next();
    });

    app.use('/api/messages', messageRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    // Handle 404s
    app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(PORT, () => {
      console.log(`Reservation service running on port ${PORT}. Update frontend .env if needed.`);
    }).on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Startup check failed:', error.message);
    process.exit(1);
  }
}

startServer(); 