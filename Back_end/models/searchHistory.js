const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  from: { type: String, required: true },
  to: { type: String, required: true },
  dateOfJourney: { type: String },
  totalFare: { type: Number },
  stopsCount: { type: Number, default: 0 },
  routeSummary: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
