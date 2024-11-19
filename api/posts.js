// api/posts.js
const mongoose = require('mongoose');

// MongoDB connection setup
const connectToDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Already connected
  await mongoose.connect('mongodb+srv://alistairrichelle:qNwAWizbHcI19Pgk@dev-cluster.el86z.mongodb.net/?retryWrites=true&w=majority&appName=dev-cluster');
};

// Post schema and model
const postSchema = new mongoose.Schema({
  content: String,
  time: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

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
