require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);
let scoresCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('reaction_game');
    scoresCollection = db.collection('scores');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

// Routes
app.post('/scores', async (req, res) => {
  const { name, ms } = req.body;
  if (!name || typeof ms !== 'number' || ms < 50 || ms > 1000) {
    return res.status(400).json({ error: 'Invalid score data' });
  }

  try {
    await scoresCollection.insertOne({
      name: name.slice(0, 10),
      ms,
      timestamp: Date.now()
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/scores/top', async (req, res) => {
  try {
    const topScores = await scoresCollection
      .find({})
      .sort({ ms: 1 })
      .limit(10)
      .toArray();
    res.json(topScores);
  } catch (err) {
    console.error('Error fetching scores:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Connect to DB
connectDB();
