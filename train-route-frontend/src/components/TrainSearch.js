import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const TrainSearch = ({ token }) => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    dateOfJourney: "",
    maxStops: 3,
    maxFare: "",
    maxDuration: "",
    minAvailability: 1,
    page: 1,
    limit: 10,
  });

  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const headers = { "x-auth-token": token };
      const body = {
        from: formData.from.toUpperCase(),
        to: formData.to.toUpperCase(),
        dateOfJourney: formData.dateOfJourney || undefined,
        maxStops: Number(formData.maxStops),
        maxFare: formData.maxFare ? Number(formData.maxFare) : undefined,
        maxDuration: formData.maxDuration || undefined,
        minAvailability: Number(formData.minAvailability),
        page: Number(formData.page),
        limit: Number(formData.limit),
      };

      const res = await axios.post(`${API_URL}/api/trains/search-priority-bfs`, body, {
        headers,
      });

      setResults(res.data.results || []);
    } catch (err) {
      setError(err.response?.data.message || "Search failed. Try again.");
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <>
      <form className="train-form-grid" onSubmit={handleSearch} autoComplete="off">
        <div>
          <label className="form-label">From (station code) *</label>
          <input name="from" value={formData.from} onChange={handleChange} required autoFocus />
        </div>

        <div>
          <label className="form-label">To (station code) *</label>
          <input name="to" value={formData.to} onChange={handleChange} required />
        </div>

        <div>
          <label className="form-label">Date of Journey</label>
          <input name="dateOfJourney" type="date" value={formData.dateOfJourney} onChange={handleChange} />
        </div>

        <div>
          <label className="form-label">Max Stops</label>
          <input name="maxStops" type="number" min="1" max="5" value={formData.maxStops} onChange={handleChange} />
        </div>

        <div>
          <label className="form-label">Max Fare</label>
          <input name="maxFare" type="number" value={formData.maxFare} onChange={handleChange} />
        </div>

        <div>
          <label className="form-label">Max Duration (hh:mm)</label>
          <input name="maxDuration" type="text" value={formData.maxDuration} onChange={handleChange} />
        </div>

        <div>
          <label className="form-label">Min Availability</label>
          <input name="minAvailability" type="number" min="0" value={formData.minAvailability} onChange={handleChange} />
        </div>

        <div>
          <label className="form-label">Page</label>
          <input name="page" type="number" min="1" value={formData.page} onChange={handleChange} />
        </div>

        <div>
          <label className="form-label">Limit</label>
          <input name="limit" type="number" min="1" value={formData.limit} onChange={handleChange} />
        </div>

        <button className="search-btn" type="submit" disabled={loading}>
          {loading ? "Searching..." : "SEARCH"}
        </button>
      </form>

      {error && <div style={{ color: "red", fontWeight: "bold", marginTop: 16 }}>{error}</div>}

      <div className="results-section" style={{ marginTop: 10 }}>
        <h3 style={{ color: "#217adb" }}>Results</h3>
        {Array.isArray(results) && results.length > 0 ? (
          results.map((routeObj, idx) => (
            <div key={idx} className="result-card" style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
              <div><strong>Total Fare:</strong> ₹{routeObj.totalFare ?? "N/A"}</div>
              <div><strong>Total Duration:</strong> {routeObj.totalDuration ?? "N/A"}</div>
              {Array.isArray(routeObj.route) && routeObj.route.length > 0 ? (
                routeObj.route.map((leg, legIdx) => (
                  <div key={legIdx} style={{ marginLeft: 20 }}>
                    {leg.train ?? "Unknown Train"}: {leg.from ?? "N/A"} → {leg.to ?? "N/A"} (Fare: ₹{leg.fare ?? "N/A"})
                  </div>
                ))
              ) : (
                <div style={{ color: "#888" }}>No route details available</div>
              )}
            </div>
          ))
        ) : (
          !loading && <div style={{ color: "#888" }}>No results to display.</div>
        )}
      </div>
    </>
  );
};

export default TrainSearch;
