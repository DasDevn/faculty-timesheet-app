import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/submissions")
      .then(response => setSubmissions(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>Faculty Time Reports</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Employee ID</th>
            <th>Submission Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.SubmissionID}>
              <td>{sub.SubmissionID}</td>
              <td>{sub.EmployeeID}</td>
              <td>{sub.PeriodID}</td>
              <td>{sub.Submitted ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
