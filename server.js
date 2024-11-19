const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// App setup
const app = express();
const PORT = 46464;

// Middleware
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://alistairrichelle:qNwAWizbHcI19Pgk@dev-cluster.el86z.mongodb.net/?retryWrites=true&w=majority&appName=dev-cluster')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Schema and Model
const postSchema = new mongoose.Schema({
  content: String,
  time: { type: Date, default: Date.now },
});
const Post = mongoose.model('Post', postSchema);

// Routes
// Fetch all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ time: -1 }); // Latest first
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
app.post('/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
