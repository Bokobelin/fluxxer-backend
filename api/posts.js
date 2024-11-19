// api/posts.js
const mongoose = require('mongoose');

// MongoDB connection setup
const connectToDB = async () => {
  await mongoose.connect(process.env.MONGO_URI.toString());
};

// Post schema and model
const postSchema = new mongoose.Schema({
  content: String,
  time: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

module.exports = async (req, res) => {
  // Set CORS headers for all origins
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (you can restrict this in production)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header

  // Handle OPTIONS method (preflight request)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectToDB();

  if (req.method === 'GET') {
    try {
      const posts = await Post.find().sort({ time: -1 });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const newPost = new Post(req.body);
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
