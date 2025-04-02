import React, { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [employeeID, setEmployeeID] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    Email: "",
    FirstName: "",
    LastName: "",
  });
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");

  const toggleExpanded = (submissionId) => {
    setExpandedSubmissionId((prev) =>
      prev === submissionId ? null : submissionId
    );
  };

  const fetchEmployeeData = async () => {
    if (!employeeID) return;

    setLoading(true);
    setError("");
    setEmployeeData(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/employee/${employeeID}`
      );
      setEmployeeData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("API Error:", err);
    }

    setLoading(false);
  };

  const handleNewEmployeeChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const addEmployee = async () => {
    setAddSuccess("");
    setAddError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/employees",
        newEmployee
      );
      setAddSuccess(
        `Employee added successfully! Generated ID: ${response.data.EmployeeID}`
      );
      setNewEmployee({ Email: "", FirstName: "", LastName: "" });
    } catch (err) {
      setAddError("Failed to add employee. Please try again.");
      console.error("Error adding employee:", err);
    }
  };

  // 🗑️ Delete a time off record
  const deleteTimeOffRecord = async (timeOffID) => {
    const confirm = window.confirm("Are you sure you want to delete this time off entry?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/timeoff/${timeOffID}`);
      setEmployeeData((prev) => ({
        ...prev,
        timeOffRecords: prev.timeOffRecords.filter(rec => rec.TimeOffID !== timeOffID),
      }));
    } catch (err) {
      console.error("Error deleting time off record:", err);
      alert("Failed to delete time off record.");
    }
  };

  return (
    <div className="container mt-4">
      <div className={`row ${employeeData ? "flex-column" : ""}`}>
        {/* Search Employee Section */}
        <div className={`${employeeData ? "col-12" : "col-md-6"}`}>
          <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Search Employee</h3>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter Employee ID..."
                className="form-control"
                value={employeeID}
                onChange={(e) => setEmployeeID(e.target.value)}
              />
              <button
                className="btn btn-primary mt-2 w-100"
                onClick={fetchEmployeeData}
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {error && <p className="text-danger">{error}</p>}

            {employeeData && (
              <div className="mt-4">
                <h4>
                  Time Report Submissions for:{" "}
                  <strong>
                    {employeeData.FirstName} {employeeData.LastName}
                  </strong>
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
                        const matchingTimeOff =
                          employeeData.timeOffRecords.filter(
                            (record) => record.PeriodID === sub.PeriodID
                          );

                        return (
                          <React.Fragment key={sub.SubmissionID}>
                            <tr>
                              <td>{sub.Period}</td>
                              <td>{sub.Submitted ? "Yes" : "No"}</td>
                              <td>{sub.SubmissionDate?.split("T")[0]}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => toggleExpanded(sub.SubmissionID)}
                                >
                                  {expandedSubmissionId === sub.SubmissionID
                                    ? "Hide Time Off"
                                    : "Show Time Off"}
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
                                          <th>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {matchingTimeOff.map((record) => (
                                          <tr key={record.TimeOffID}>
                                            <td>{record.TimeOffCode}</td>
                                            <td>{record.StartDate?.split("T")[0]}</td>
                                            <td>{record.EndDate?.split("T")[0]}</td>
                                            <td>{record.HoursOff}</td>
                                            <td>
                                              <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => deleteTimeOffRecord(record.TimeOffID)}
                                              >
                                                Delete
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="text-muted mb-0">
                                      No time off records for this period.
                                    </p>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Employee Section */}
        <div className={`${employeeData ? "col-12 mt-4" : "col-md-6"}`}>
          <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Add Employee</h3>
            <input
              type="email"
              name="Email"
              placeholder="Email"
              className="form-control mb-2"
              value={newEmployee.Email}
              onChange={handleNewEmployeeChange}
            />
            <input
              type="text"
              name="FirstName"
              placeholder="First Name"
              className="form-control mb-2"
              value={newEmployee.FirstName}
              onChange={handleNewEmployeeChange}
            />
            <input
              type="text"
              name="LastName"
              placeholder="Last Name"
              className="form-control mb-2"
              value={newEmployee.LastName}
              onChange={handleNewEmployeeChange}
            />
            <button className="btn btn-primary mt-2 w-100" onClick={addEmployee}>
              Add Employee
            </button>

            {addSuccess && <p className="text-success mt-2">{addSuccess}</p>}
            {addError && <p className="text-danger mt-2">{addError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
