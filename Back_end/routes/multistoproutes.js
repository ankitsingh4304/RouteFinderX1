const express = require('express');
const PriorityQueue = require('js-priority-queue');
const Train = require('../models/train');
const SearchHistory = require('../models/searchHistory');
const router = express.Router();
const auth = require('../middlewares/auth');

const isAvailable = (availability) => availability > 0;

const addDurations = (durations) => {
  let totalMinutes = 0;
  durations.forEach(time => {
    if (typeof time === 'number') {
      totalMinutes += time;
    } else {
      const [h, m] = time.split(':').map(Number);
      totalMinutes += h * 60 + m;
    }
  });
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}:${mins.toString().padStart(2,'0')}`;
};

const durationToMinutes = (duration) => {
  if (typeof duration === 'number') return duration;
  if (!duration) return 0;
  const [hours, mins] = duration.split(':').map(Number);
  return hours * 60 + mins;
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Issue 1 & 6: Build in-memory adjacency graph, expanding stopDetails into sub-legs
const buildGraph = (allTrains) => {
  const graph = new Map();
  const addLeg = (from, leg) => {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push(leg);
  };

  allTrains.forEach(train => {
    if (train.stopDetails && train.stopDetails.length > 0) {
      // Expand stopDetails into all valid forward sub-legs
      for (let i = 0; i < train.stopDetails.length - 1; i++) {
        for (let j = i + 1; j < train.stopDetails.length; j++) {
          const stopI = train.stopDetails[i];
          const stopJ = train.stopDetails[j];
          const leg = {
            trainName: train.trainName,
            trainNumber: train.trainNumber,
            from: stopI.station,
            to: stopJ.station,
            fare: stopJ.cumulativeFare - stopI.cumulativeFare,
            duration: stopJ.cumulativeDuration - stopI.cumulativeDuration,
            departureTime: stopI.departureTime,
            arrivalTime: stopJ.arrivalTime,
            availability: train.availability
          };
          addLeg(stopI.station, leg);
        }
      }
    } else {
      // Backward compatibility for trains without stopDetails
      const leg = {
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        from: train.source,
        to: train.destination,
        fare: train.fare,
        duration: durationToMinutes(train.duration),
        departureTime: null,
        arrivalTime: null,
        availability: train.availability
      };
      addLeg(train.source, leg);
    }
  });
  return graph;
};

router.post('/search-priority-bfs', auth, async (req, res) => {
  const {
    from,
    to,
    dateOfJourney,
    maxStops,
    maxTransfers,
    maxFare,
    maxDuration,
    minAvailability,
    minTransferTime,
    page = 1,
    limit = 10
  } = req.body;

  try {
    if (!from || !to) {
      return res.status(400).json({ success: false, message: "'from' and 'to' are required" });
    }

    // Issue 2: Accept both maxStops (legacy) and maxTransfers; internally use maxTransfers
    const actualMaxTransfers = maxTransfers !== undefined ? maxTransfers : (maxStops !== undefined ? maxStops : 2);
    // Issue 3: Minimum transfer time between connecting trains (default 30 minutes)
    const minTransferMinutes = durationToMinutes(minTransferTime || "0:30");

    // Issue 6: One-shot load — build entire graph in memory, zero awaits in BFS loop
    const query = dateOfJourney ? { dateOfJourney } : {};
    const allTrains = await Train.find(query).lean();
    const graph = buildGraph(allTrains);

    // ── Direct trains ──
    let directLegs = [];
    if (graph.has(from)) {
      directLegs = graph.get(from).filter(leg =>
        leg.to === to &&
        isAvailable(leg.availability) &&
        (minAvailability ? leg.availability >= minAvailability : true) &&
        (maxFare ? leg.fare <= maxFare : true) &&
        (maxDuration ? leg.duration <= durationToMinutes(maxDuration) : true)
      );
    }

    if (directLegs.length > 0) {
      directLegs.sort((a, b) => a.fare - b.fare);

      const confirmedDirect = directLegs.map(leg => ({
        route: [{ train: leg.trainName, from: leg.from, to: leg.to, fare: leg.fare, departureTime: leg.departureTime, arrivalTime: leg.arrivalTime }],
        totalFare: leg.fare,
        totalDuration: addDurations([leg.duration]),
        transfers: 0
      }));

      // Issue 5: Apply pagination to direct results
      const startIndex = (page - 1) * limit;
      const pagedDirect = confirmedDirect.slice(startIndex, startIndex + limit);

      try {
        const topDirect = confirmedDirect[0];
        await SearchHistory.create({
          userId: req.user.userId,
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          dateOfJourney,
          totalFare: topDirect.totalFare,
          stopsCount: 1,
          routeSummary: [topDirect.route[0].train]
        });
      } catch (logErr) {
        console.error("Auto log direct search history error:", logErr);
      }

      return res.json({
        success: true,
        results: pagedDirect,
        totalResults: confirmedDirect.length,
        page,
        limit,
        message: "Direct trains available matching filters"
      });
    }

    // ── BFS multi-stop search ──
    const pq = new PriorityQueue({
      comparator: (a, b) => {
        if (a.transfers !== b.transfers) return a.transfers - b.transfers;
        return a.totalFare - b.totalFare;
      }
    });

    // Issue 4: Proper visited-set with station + time bucket + dominance check
    const visited = new Map(); // Map<stateKey, bestFare>
    const results = [];
    let routesExplored = 0;
    const MAX_ROUTES_EXPLORED = 1000;

    // Seed initial legs from origin
    if (graph.has(from)) {
      for (const leg of graph.get(from)) {
        if (
          !isAvailable(leg.availability) ||
          (minAvailability ? leg.availability < minAvailability : false)
        ) continue;
        if (maxFare && leg.fare > maxFare) continue;
        if (maxDuration && leg.duration > durationToMinutes(maxDuration)) continue;

        pq.queue({
          currentStation: leg.to,
          route: [{ train: leg.trainName, from: leg.from, to: leg.to, fare: leg.fare, departureTime: leg.departureTime, arrivalTime: leg.arrivalTime }],
          totalFare: leg.fare,
          totalDuration: leg.duration,
          transfers: 0,
          arrivalTime: leg.arrivalTime,
          lastTrainNumber: leg.trainNumber
        });
      }
    }

    while (pq.length > 0 && routesExplored < MAX_ROUTES_EXPLORED) {
      const state = pq.dequeue();
      routesExplored++;

      // Found destination
      if (state.currentStation === to) {
        results.push({
          route: state.route,
          totalFare: state.totalFare,
          totalDuration: addDurations([state.totalDuration]),
          transfers: state.transfers
        });
        continue;
      }

      if (state.transfers >= actualMaxTransfers) continue;

      // Issue 4: Time-bucketed state key with fare dominance
      const timeBucket = Math.floor(timeToMinutes(state.arrivalTime) / 15);
      const stateKey = `${state.currentStation}@${timeBucket}`;

      if (visited.has(stateKey) && visited.get(stateKey) <= state.totalFare) {
        continue;
      }
      visited.set(stateKey, state.totalFare);

      if (!graph.has(state.currentStation)) continue;

      for (const leg of graph.get(state.currentStation)) {
        // Availability check
        if (
          !isAvailable(leg.availability) ||
          (minAvailability ? leg.availability < minAvailability : false)
        ) continue;

        // Issue 3: Transfer-time validation
        let nextTransfers = state.transfers;
        if (leg.trainNumber !== state.lastTrainNumber) {
          nextTransfers++;
          if (nextTransfers > actualMaxTransfers) continue;

          // Validate minimum transfer time between arrival and next departure
          if (state.arrivalTime && leg.departureTime) {
            const arrMin = timeToMinutes(state.arrivalTime);
            const depMin = timeToMinutes(leg.departureTime);
            // Handle cross-midnight by adding 24h
            let waitTime = depMin - arrMin;
            if (waitTime < 0) waitTime += 24 * 60;
            if (waitTime < minTransferMinutes) continue;
          }
        }

        const newFare = state.totalFare + leg.fare;
        if (maxFare && newFare > maxFare) continue;

        const newDuration = state.totalDuration + leg.duration;
        if (maxDuration && newDuration > durationToMinutes(maxDuration)) continue;

        const newRoute = [...state.route, { train: leg.trainName, from: leg.from, to: leg.to, fare: leg.fare, departureTime: leg.departureTime, arrivalTime: leg.arrivalTime }];

        pq.queue({
          currentStation: leg.to,
          route: newRoute,
          totalFare: newFare,
          totalDuration: newDuration,
          transfers: nextTransfers,
          arrivalTime: leg.arrivalTime,
          lastTrainNumber: leg.trainNumber
        });
      }
    }

    // Remove duplicate routes
    const uniqueRoutes = [];
    const seen = new Set();
    for (const r of results) {
      const key = r.route.map(s => s.from + '-' + s.to + ':' + s.train).join('|');
      if (!seen.has(key)) {
        uniqueRoutes.push(r);
        seen.add(key);
      }
    }

    uniqueRoutes.sort((a, b) => a.totalFare - b.totalFare);

    const message = routesExplored >= MAX_ROUTES_EXPLORED ?
      "Partial results returned due to route exploration limit" : "";

    if (uniqueRoutes.length === 0) {
      return res.json({ success: true, results: [], message: "No confirmed routes found" });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const pagedResults = uniqueRoutes.slice(startIndex, endIndex);

    try {
      const topRoute = uniqueRoutes[0];
      await SearchHistory.create({
        userId: req.user.userId,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        dateOfJourney,
        totalFare: topRoute ? topRoute.totalFare : 0,
        stopsCount: topRoute && topRoute.route ? topRoute.route.length : 0,
        routeSummary: topRoute && topRoute.route ? topRoute.route.map(r => r.train) : []
      });
    } catch (logErr) {
      console.error("Auto log multi-stop search history error:", logErr);
    }

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
