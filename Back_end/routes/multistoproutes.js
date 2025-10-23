const express = require('express');
const PriorityQueue = require('js-priority-queue');
const Train = require('../models/train');
const router = express.Router();
const auth = require('../middlewares/auth');

const isAvailable = (availability) => availability > 0;

const addDurations = (durations) => {
  let totalMinutes = 0;
  durations.forEach(time => {
    const [h, m] = time.split(':').map(Number);
    totalMinutes += h * 60 + m;
  });
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}:${mins.toString().padStart(2,'0')}`;
};

const durationToMinutes = (duration) => {
  const [hours, mins] = duration.split(':').map(Number);
  return hours * 60 + mins;
};

router.post('/search-priority-bfs', auth, async (req, res) => {
  const {
    from,
    to,
    dateOfJourney,
    maxStops = 3,
    maxFare,
    maxDuration,
    minAvailability,
    page = 1,
    limit = 10
  } = req.body;

  try {
    if (!from || !to) {
      return res.status(400).json({ success: false, message: "'from' and 'to' are required" });
    }

    const filterByDate = (trainList) => {
      if (!dateOfJourney) return trainList;
      return trainList.filter(t => t.dateOfJourney === dateOfJourney);
    };

    const getTrains = async (source, destination) => {
      if (destination === '*') {
        return await Train.find({ source }).lean();
      } else {
        return await Train.find({ source, destination }).lean();
      }
    };

    const stationTrainCache = new Map();

    const getTrainsCached = async (source, destination) => {
      const key = `${source}-${destination || ''}-${dateOfJourney || ''}`;
      if (stationTrainCache.has(key)) {
        return stationTrainCache.get(key);
      }
      let trains = await getTrains(source, destination);
      trains = filterByDate(trains);
      stationTrainCache.set(key, trains);
      return trains;
    };

    const queue = new PriorityQueue({
      comparator: (a, b) => {
        if (a.stops !== b.stops) return a.stops - b.stops;
        return a.totalFare - b.totalFare;
      }
    });

    const visited = new Set();
    const results = [];
    let routesExplored = 0;
    const MAX_ROUTES_EXPLORED = 1000;

    // Direct trains first
    const directTrainsRaw = await getTrains(from, to);
    const directTrains = filterByDate(directTrainsRaw);

    const confirmedDirect = directTrains.filter(t =>
      isAvailable(t.availability) &&
      (minAvailability ? t.availability >= minAvailability : true) &&
      (maxFare ? t.fare <= maxFare : true) &&
      (maxDuration ? durationToMinutes(t.duration) <= durationToMinutes(maxDuration) : true)
    );

    if (confirmedDirect.length > 0) {
      confirmedDirect.sort((a, b) => a.fare - b.fare);
      return res.json({
        success: true,
        results: confirmedDirect.map(t => ({
          route: [{ train: t.trainName, from: t.source, to: t.destination, fare: t.fare }],
          totalFare: t.fare,
          totalDuration: t.duration
        })),
        totalResults: confirmedDirect.length,
        page: 1,
        limit: confirmedDirect.length,
        message: "Direct trains available matching filters"
      });
    }

    // BFS multi-stop search initialization
    const initialTrainsRaw = await getTrains(from, '*');
    const initialTrains = filterByDate(initialTrainsRaw);
    for (const train of initialTrains) {
      if (
        isAvailable(train.availability) &&
        (minAvailability ? train.availability >= minAvailability : true) &&
        (maxFare ? train.fare <= maxFare : true) &&
        (maxDuration ? durationToMinutes(train.duration) <= durationToMinutes(maxDuration) : true)
      ) {
        queue.queue({
          current: train.destination,
          route: [{ train: train.trainName, from: train.source, to: train.destination, fare: train.fare }],
          totalFare: train.fare,
          totalDuration: train.duration,
          stops: 1
        });
      }
    }

    while (queue.length > 0) {
      if (routesExplored++ > MAX_ROUTES_EXPLORED) break;

      const { current, route, totalFare, totalDuration, stops } = queue.dequeue();

      if (stops > maxStops) continue;
      if (visited.has(current + route.length)) continue;
      visited.add(current + route.length);

      const nextTrainsRaw = await getTrainsCached(current, '*');

      for (const next of nextTrainsRaw) {
        if (
          !isAvailable(next.availability) ||
          (minAvailability ? next.availability < minAvailability : false)
        ) continue;

        const newFare = totalFare + next.fare;
        if (maxFare && newFare > maxFare) continue;

        const newDuration = addDurations([totalDuration, next.duration]);
        if (maxDuration && durationToMinutes(newDuration) > durationToMinutes(maxDuration)) continue;

        const newRoute = [...route, { train: next.trainName, from: next.source, to: next.destination, fare: next.fare }];

        if (next.destination === to) {
          results.push({ route: newRoute, totalFare: newFare, totalDuration: newDuration });
        } else if (stops < maxStops) {
          queue.queue({
            current: next.destination,
            route: newRoute,
            totalFare: newFare,
            totalDuration: newDuration,
            stops: stops + 1
          });
        }
      }
    }

    // Remove duplicate routes
    const uniqueRoutes = [];
    const seen = new Set();
    for (const r of results) {
      const key = r.route.map(s => s.from + '-' + s.to).join('|');
      if (!seen.has(key)) {
        uniqueRoutes.push(r);
        seen.add(key);
      }
    }

    uniqueRoutes.sort((a, b) => a.totalFare - b.totalFare);

    const message = routesExplored > MAX_ROUTES_EXPLORED ?
      "Partial results returned due to route exploration limit" : "";

    if (uniqueRoutes.length === 0) {
      return res.json({ success: true, results: [], message: "No confirmed routes found" });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const pagedResults = uniqueRoutes.slice(startIndex, endIndex);

    res.json({
      success: true,
      results: pagedResults,
      totalResults: uniqueRoutes.length,
      page,
      limit,
      message
    });

  } catch (err) {
    console.error("Error searching routes:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
