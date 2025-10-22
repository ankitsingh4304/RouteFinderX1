const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true, index: true },
  trainName: { type: String, required: true },
  source: { type: String, required: true, index: true },
  destination: { type: String, required: true, index: true },
  stops: { type: [String], required: true },
  fare: { type: Number, required: true },
  duration: { type: String, required: true },
  availability: { type: Number, required: true },
  dateOfJourney: { type: String, required: true }
});

module.exports = mongoose.model('Train', TrainSchema);
