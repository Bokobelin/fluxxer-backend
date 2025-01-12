import { createClient } from 'webdav';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// WebDAV Client Setup
const webdavClient = createClient(
  'https://u441636.your-storagebox.de',
  {
    username: 'u441636',
    password: process.env.WEBDAV_PASSWORD,
  }
);

// Express Setup
const app = express();
const PORT = 45454;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper Functions
const postsFile = '/posts.json'; // File to store all posts

// Get all posts
const getPosts = async () => {
  try {
    const data = await webdavClient.getFileContents(postsFile, { format: 'text' });
    return JSON.parse(data || '[]'); // Default to empty array if no data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // File not found, return an empty array
      return [];
    }
    throw error; // Rethrow other errors
  }
};

// Save posts
const savePosts = async (posts) => {
  const jsonData = JSON.stringify(posts, null, 2);
  await webdavClient.putFileContents(postsFile, jsonData, { overwrite: true });
};

// Routes

// Fetch all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await getPosts();
    res.status(200).json(posts.reverse()); // Return posts in reverse order (latest first)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new post
app.post('/posts', async (req, res) => {
  try {
    const posts = await getPosts();
    const newPost = {
      content: req.body.content,
      category: req.body.category || 'Uncategorized', // Add category field
      time: new Date().toISOString(),
    };
    posts.push(newPost); // Add new post
    await savePosts(posts); // Save to WebDAV
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
