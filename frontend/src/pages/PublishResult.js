import React, { useEffect, useState } from "react";
import "./PublishResult.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;
const API = `${API_BASE}/api`;

function PublishResult() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API}/results/`, {
        credentials: "include",
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load results");
        setResults([]);
        return;
      }

      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error fetching results", error);
      setError(error.message || "Unable to load published results");
    }
  };

  const filteredResults = results.filter((r) =>
  (r.roll_number || "").toLowerCase().includes(search.toLowerCase())
);
  return (
    <div className="result-container">
      <h2>Published Results</h2>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <input
  className="search-bar"
  type="text"
  placeholder="Search by Roll Number..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
      <div className="result-table-shell">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Grade</th>
            <th>Remarks</th>
          </tr>
        </thead>

        <tbody>
          {filteredResults.map((r) => (
            
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.roll_number}</td>
              <td>{r.grade ?? "result.grade"}</td>
              <td>{r.remarks}</td>
            </tr>
          )
          )}
          {filteredResults.length === 0 && (
  <tr>
    <td colSpan="4">No matching results</td>
  </tr>
)}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default PublishResult;