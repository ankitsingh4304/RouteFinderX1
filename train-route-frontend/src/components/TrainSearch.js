import React, { useState } from "react";
import axios from "axios";

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
      const res = await axios.post("/api/trains/search-priority-bfs", body, { headers });
      console.log("Full API response:", res.data);
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
          <div className="form-label">From (station code) *</div>
          <input name="from" value={formData.from} onChange={handleChange} required autoFocus />
        </div>
        <div>
          <div className="form-label">To (station code) *</div>
          <input name="to" value={formData.to} onChange={handleChange} required />
        </div>
        <div>
          <div className="form-label">Date of Journey</div>
          <input name="dateOfJourney" type="date" value={formData.dateOfJourney} onChange={handleChange} />
        </div>
        <div>
          <div className="form-label">Max Stops</div>
          <input name="maxStops" type="number" min="1" max="5" value={formData.maxStops} onChange={handleChange} />
        </div>
        <div>
          <div className="form-label">Max Fare</div>
          <input name="maxFare" type="number" value={formData.maxFare} onChange={handleChange} />
        </div>
        <div>
          <div className="form-label">Max Duration (hh:mm)</div>
          <input name="maxDuration" type="text" value={formData.maxDuration} onChange={handleChange} />
        </div>
        <div>
          <div className="form-label">Min Availability</div>
          <input name="minAvailability" type="number" min="0" value={formData.minAvailability} onChange={handleChange} />
        </div>
        <div>
          <div className="form-label">Page</div>
          <input name="page" type="number" min="1" value={formData.page} onChange={handleChange} />
        </div>
        <div>
          <div className="form-label">Limit</div>
          <input name="limit" type="number" min="1" value={formData.limit} onChange={handleChange} />
        </div>
        <button className="search-btn" type="submit" disabled={loading}>
          {loading ? "Searching..." : "SEARCH"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#d32f2f", fontWeight: 600, margin: "13px 0", fontSize: '1.16rem' }}>{error}</div>
      )}

      {/* Debug output for raw results */}
      <div style={{ whiteSpace: "pre-wrap", backgroundColor: "#f5f5f5", margin: "15px 0", padding: 10, borderRadius: 4 }}>
        <strong>Raw Results Data (debug):</strong>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>

      <div className="results-section">
        <div style={{ fontWeight: 600, fontSize: "1.38rem", color: "#217adb", margin: "14px 0 7px 0" }}>
          Results
        </div>

        {Array.isArray(results) && results.length > 0 ? (
          results.map((routeObj, i) => (
            <div className="result-card" key={i}>
              <div className="result-fare">Total Fare: ₹{routeObj.totalFare ?? "N/A"}</div>
              <div className="result-duration">Total Duration: {routeObj.totalDuration ?? "N/A"}</div>
              {Array.isArray(routeObj.route) && routeObj.route.length > 0 ? (
                routeObj.route.map((leg, idx) => (
                  <div className="result-leg" key={idx}>
                    {leg.train ?? "Unknown Train"}: {leg.from ?? "N/A"} → {leg.to ?? "N/A"} (Fare: ₹{leg.fare ?? "N/A"})
                  </div>
                ))
              ) : (
                <div style={{ color: "#888" }}>No route details available</div>
              )}
            </div>
          ))
        ) : (
          !loading && (
            <div style={{ color: "#888", marginTop: 24, fontSize: "1.07rem" }}>
              No results to display.
            </div>
          )
        )}
      </div>
    </>
  );
};

export default TrainSearch;
