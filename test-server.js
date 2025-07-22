const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
});
