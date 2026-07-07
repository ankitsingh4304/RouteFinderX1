require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multistopRoutes = require('./routes/multistoproutes');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true
}));


app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trains';

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("Using URI:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/trains', multistopRoutes);

app.get('/', (req, res) => res.send('Train route finder API is running'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
