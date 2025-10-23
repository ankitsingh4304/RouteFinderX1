require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multistopRoutes = require('./routes/multistoproutes');
const authRoutes = require('./routes/auth');

const app = express();

const allowedOrigins = [
  'https://route-finder-x.vercel.app',       // your main frontend deployment URL
  'https://route-finder-x-3j3x.vercel.app',  // possible preview URL(s)
  // add other allowed origins as needed
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trains';

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
