import { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [employeeID, setEmployeeID] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEmployeeData = async () => {
    if (!employeeID) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`http://localhost:5000/api/employee/${employeeID}`);
      setEmployeeData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("API Error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="card p-4 shadow-sm">
      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Enter Employee ID..."
          className="form-control"
          value={employeeID}
          onChange={(e) => setEmployeeID(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={fetchEmployeeData} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Display Results */}
      {error && <p className="text-danger">{error}</p>}

      {employeeData && (
        <div className="mt-4">
          {/* Time Report Submissions Table */}
          <h4>Time Report Submissions</h4>
          <table className="table table-bordered table-striped">
            <thead className="table-primary">
              <tr>
                <th>Submission ID</th>
                <th>Period</th>
                <th>Submission Date</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.submissions.length > 0 ? (
                employeeData.submissions.map((sub) => (
                  <tr key={sub.SubmissionID}>
                    <td>{sub.SubmissionID}</td>
                    <td>{sub.Period}</td>  {/* Now using Period column */}
                    <td>{sub.SubmissionDate}</td>
                    <td>{sub.Submitted ? "Yes" : "No"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
