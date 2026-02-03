require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const db = require('./db');

const PORT = process.env.PORT || 4000;

const app = express();

// Security middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS - allow frontend origin during development
app.use(cors({ origin: true, credentials: true }));

// Rate limiting for all requests
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Mount routes
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
