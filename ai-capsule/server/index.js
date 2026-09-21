require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

// Initializes the DB / creates the table on first run.
require('./db/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// --- Public health check (required by spec, must stay unauthenticated) ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));         
app.use('/api/capsules', require('./routes/capsules'));

// --- Serve the built React app in production (same origin as the API) ---
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Capsule server running on http://localhost:${PORT}`);
});