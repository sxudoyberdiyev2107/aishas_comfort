const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Next.js frontend port
  credentials: true // allow sending secure cookies/tokens
}));

app.use(express.json());
app.use(cookieParser());

// Mount API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express API Server successfully running on http://localhost:${PORT}`);
});
