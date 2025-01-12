import { createClient } from 'webdav';
import express from 'express';
import { json } from 'express'; // Use express's built-in json middleware
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// App setup
const app = express();
const PORT = 45454;

// Middleware
app.use(cors());
app.use(json()); // Using express built-in json middleware

// WebDAV Client Setup
const webdavClient = createClient(
  "https://u441636.your-storagebox.de", // Ensure the full URL is used
  {
    username: "u441636", // Make sure there are no extra spaces
    password: process.env.WEBDAV_PASSWORD,
    clientOptions: {
        rejectUnauthorized: false // Disable SSL verification temporarily
      }
  }
);

// Fetch all posts
app.get('/posts', async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Fetch posts from WebDAV
    let posts = [];
    try {
      const fileContents = await webdavClient.getFileContents('/test-posts.json', { format: 'text' });
      posts = JSON.parse(fileContents);
    } catch (err) {
      if (err.status !== 404) throw err; // Ignore if file doesn't exist
    }

    // Sort posts by time (latest first)
    posts.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: 'Failed to fetch posts: ' + err.message });
  }
});

// Create a new post
app.post('/posts', async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Fetch existing posts
    let posts = [];
    try {
      const fileContents = await webdavClient.getFileContents('/test-posts.json', { format: 'text' });
      posts = JSON.parse(fileContents);
    } catch (err) {
      if (err.status !== 404) throw err; // Ignore if file doesn't exist
    }

    // Add the new post
    const newPost = { ...req.body, time: new Date() };
    posts.push(newPost);

    // Save updated posts to WebDAV
    await webdavClient.putFileContents('/test-posts.json', JSON.stringify(posts, null, 2));

    res.status(201).json(newPost); // Respond with the newly created post
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: 'Failed to create post: ' + err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
