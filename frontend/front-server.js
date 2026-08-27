const express = require('express');
const path = require('path');
const app = express();

const PORT = 3001;
const DIST_DIR = path.join(__dirname, 'dist');

// Serve static files from dist
app.use(express.static(DIST_DIR));

// For React Router (SPA) - always return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend running on port ${PORT}`);
});
