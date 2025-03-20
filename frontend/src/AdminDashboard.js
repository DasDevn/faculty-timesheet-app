import React, { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [employeeID, setEmployeeID] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);

  // New state for adding an employee
  const [newEmployee, setNewEmployee] = useState({
    Email: "",
    FirstName: "",
    LastName: ""
  });
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");

  // Toggle expanded submission
  const toggleExpanded = (submissionId) => {
    setExpandedSubmissionId((prev) => (prev === submissionId ? null : submissionId));
  };

  // Fetch employee data
  const fetchEmployeeData = async () => {
    if (!employeeID) return;

    setLoading(true);
    setError("");
    setEmployeeData(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/employee/${employeeID}`);
      setEmployeeData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("API Error:", err);
    }

    setLoading(false);
  };

  // Handle input changes for adding an employee
  const handleNewEmployeeChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  // Submit new employee to the backend
  const addEmployee = async () => {
    setAddSuccess("");
    setAddError("");

    try {
      const response = await axios.post("http://localhost:5000/api/employees", newEmployee);
      setAddSuccess(`Employee added successfully! Generated ID: ${response.data.EmployeeID}`);
      setNewEmployee({ Email: "", FirstName: "", LastName: "" }); // Reset form
    } catch (err) {
      setAddError("Failed to add employee. Please try again.");
      console.error("Error adding employee:", err);
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      {/* Search Employee */}
      <h3 className="mb-3">Search Employee</h3>
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

      {/* Display Errors */}
      {error && <p className="text-danger">{error}</p>}

      {/* Display Results */}
      {employeeData && (
        <div className="mt-4">
          <h4>
            Time Report Submissions for: <strong>{employeeData.FirstName} {employeeData.LastName}</strong>
          </h4>

          <table className="table table-bordered table-striped mt-3">
            <thead className="table-primary">
              <tr>
                <th>Reporting Period</th>
                <th>Submitted</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.submissions.length > 0 ? (
                employeeData.submissions.map((sub) => {
                  const matchingTimeOff = employeeData.timeOffRecords.filter(
                    (record) => record.PeriodID === sub.PeriodID
                  );

                  return (
                    <React.Fragment key={sub.SubmissionID}>
                      <tr>
                        <td>{sub.Period}</td>
                        <td>{sub.Submitted ? "Yes" : "No"}</td>
                        <td>{sub.SubmissionDate?.split("T")[0]}</td>
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => toggleExpanded(sub.SubmissionID)}>
                            {expandedSubmissionId === sub.SubmissionID ? "Hide Time Off" : "Show Time Off"}
                          </button>
                        </td>
                      </tr>

                      {expandedSubmissionId === sub.SubmissionID && (
                        <tr>
                          <td colSpan="4">
                            {matchingTimeOff.length > 0 ? (
                              <table className="table table-sm table-bordered mt-2">
                                <thead className="table-light">
                                  <tr>
                                    <th>TimeOffCode</th>
                                    <th>StartDate</th>
                                    <th>EndDate</th>
                                    <th>HoursOff</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {matchingTimeOff.map((record) => (
                                    <tr key={record.TimeOffID}>
                                      <td>{record.TimeOffCode}</td>
                                      <td>{record.StartDate?.split("T")[0]}</td>
                                      <td>{record.EndDate?.split("T")[0]}</td>
                                      <td>{record.HoursOff}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-muted mb-0">No time off records for this period.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Section */}
      <h3 className="mt-4">Add Employee</h3>
      <input type="email" name="Email" placeholder="Email" className="form-control mb-2" value={newEmployee.Email} onChange={handleNewEmployeeChange} />
      <input type="text" name="FirstName" placeholder="First Name" className="form-control mb-2" value={newEmployee.FirstName} onChange={handleNewEmployeeChange} />
      <input type="text" name="LastName" placeholder="Last Name" className="form-control mb-2" value={newEmployee.LastName} onChange={handleNewEmployeeChange} />
      <button className="btn btn-success mt-2" onClick={addEmployee}>Add Employee</button>

      {addSuccess && <p className="text-success mt-2">{addSuccess}</p>}
      {addError && <p className="text-danger mt-2">{addError}</p>}
    </div>
  );
};

export default AdminDashboard;
