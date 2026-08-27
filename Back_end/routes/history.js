const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const SearchHistory = require('../models/searchHistory');

// GET /api/user/history - Fetch user search history
router.get('/', auth, async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, history });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ success: false, message: "Server error fetching history" });
  }
});

// POST /api/user/history - Save a search entry
router.post('/', auth, async (req, res) => {
  const { from, to, dateOfJourney, totalFare, stopsCount, routeSummary } = req.body;

  if (!from || !to) {
    return res.status(400).json({ success: false, message: "From and To are required" });
  }

  try {
    const entry = new SearchHistory({
      userId: req.user.userId,
      from,
      to,
      dateOfJourney,
      totalFare,
      stopsCount,
      routeSummary: routeSummary || []
    });

    await entry.save();
    res.json({ success: true, entry });
  } catch (err) {
    console.error("Error saving search history:", err);
    res.status(500).json({ success: false, message: "Server error saving history" });
  }
});

// DELETE /api/user/history/:id - Remove single history item
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await SearchHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: "History item not found" });
    }

    res.json({ success: true, message: "History item removed" });
  } catch (err) {
    console.error("Error deleting history item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/user/history/clear - Clear all user history
router.delete('/clear/all', auth, async (req, res) => {
  try {
    await SearchHistory.deleteMany({ userId: req.user.userId });
    res.json({ success: true, message: "Search history cleared" });
  } catch (err) {
    console.error("Error clearing history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
