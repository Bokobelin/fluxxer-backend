import { createClient } from 'webdav';
import dotenv from 'dotenv';

dotenv.config();

const webdavClient = createClient("https://u441636.your-storagebox.de", {
  username: "u441636",
  password: process.env.WEBDAV_PASSWORD,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const fileContents = await webdavClient.getFileContents('/test-posts.json', { format: 'text' });
      const posts = JSON.parse(fileContents);
      posts.sort((a, b) => new Date(b.time) - new Date(a.time));
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch posts: ' + err.message });
    }
  } else if (req.method === 'POST') {
    try {
      let posts = [];
      try {
        const fileContents = await webdavClient.getFileContents('/test-posts.json', { format: 'text' });
        posts = JSON.parse(fileContents);
      } catch (err) {
        if (err.status !== 404) throw err;
      }

      const newPost = { ...req.body, time: new Date() };
      posts.push(newPost);
      await webdavClient.putFileContents('/test-posts.json', JSON.stringify(posts, null, 2));
      res.status(201).json(newPost);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create post: ' + err.message });
    }
  }
}
