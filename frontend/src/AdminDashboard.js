import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from the backend API
  useEffect(() => {
    axios.get("http://localhost:5000/api/submissions")
      .then(response => setSubmissions(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  // Filter submissions based on User ID (EmployeeID)
  const filteredSubmissions = submissions.filter((sub) =>
    sub.EmployeeID.toString().includes(searchQuery)
  );

  return (
    <div className="card p-4 shadow-sm">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Employee ID..."
        className="form-control mb-3"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>Report ID</th>
              <th>Employee ID</th>
              <th>Submission Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => (
                <tr key={sub.SubmissionID}>
                  <td>{sub.SubmissionID}</td>
                  <td>{sub.EmployeeID}</td>
                  <td>{sub.SubmissionDate}</td>
                  <td>{sub.Submitted ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
