const express = require('express');
const postsHandler = require('./api/posts'); // Adjust the path if needed

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Route to handle posts API
app.all('/api/posts.js', postsHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
