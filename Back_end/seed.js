require('dotenv').config();
const mongoose = require('mongoose');
const Train = require('./models/train');
const trainsData = require('./data/train_full');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await Train.deleteMany({});
    await Train.insertMany(trainsData);
    console.log("✅ 50+ Trains seeded!");
    mongoose.connection.close();
  })
  .catch(err => console.log(err));
