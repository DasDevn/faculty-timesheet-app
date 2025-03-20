// server.js (or index.js)
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json());

// Replace these with your actual environment variables or values
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true, 
  },
};

// Test connection
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log("Connected to SQL Server!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}
connectDB();

// [Optional] Endpoint to fetch all submissions (not crucial for the new feature)
app.get('/api/submissions', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM TimeReportSubmissions");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

/**
 * API endpoint to fetch employee data by ID, including:
 *   - Submissions (with PeriodID, StartDate, EndDate, etc.)
 *   - TimeOffRecords
 *   - ReportingPeriods (optional)
 *   - User's first and last name
 */
app.get('/api/employee/:employeeID', async (req, res) => {
  const { employeeID } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    // 1) Get user info (FirstName, LastName) from the Users table
    const userQuery = await pool.request()
      .input('EmployeeID', sql.NVarChar, employeeID)
      .query(`SELECT TOP 1 FirstName, LastName
              FROM Users
              WHERE EmployeeID = @EmployeeID`);

    // 2) Get Time Report Submissions joined with ReportingPeriods
    const submissionsQuery = await pool.request()
    .input('EmployeeID', sql.NVarChar, employeeID)
    .query(`
      SELECT trs.SubmissionID,
            trs.EmployeeID,
            trs.PeriodID,
            CONVERT(VARCHAR(10), rp.StartDate, 23) AS StartDate,
            CONVERT(VARCHAR(10), rp.EndDate, 23)   AS EndDate,
            CONVERT(VARCHAR(10), trs.SubmissionDate, 23) AS SubmissionDate,
            trs.Submitted
      FROM TimeReportSubmissions trs
      INNER JOIN ReportingPeriods rp ON trs.PeriodID = rp.PeriodID
      WHERE trs.EmployeeID = @EmployeeID
    `);


    // 3) Get all Time Off Records for the employee
    const timeOffRecordsQuery = await pool.request()
      .input('EmployeeID', sql.NVarChar, employeeID)
      .query(`SELECT *
              FROM TimeOffRecords
              WHERE EmployeeID = @EmployeeID`);

    // 4) Optionally get all relevant ReportingPeriods (if needed)
    const reportingPeriodsQuery = await pool.request()
      .input('EmployeeID', sql.NVarChar, employeeID)
      .query(`
        SELECT *
        FROM ReportingPeriods
        WHERE PeriodID IN (
          SELECT PeriodID
          FROM TimeReportSubmissions
          WHERE EmployeeID = @EmployeeID
        )
      `);

    // Process data: We'll include the raw PeriodID so we can match it on the frontend
    const submissions = submissionsQuery.recordset.map(sub => ({
      SubmissionID: sub.SubmissionID,
      EmployeeID: sub.EmployeeID,
      PeriodID: sub.PeriodID,
      Period: (sub.StartDate && sub.EndDate) ? `${sub.StartDate} - ${sub.EndDate}` : "N/A",
      SubmissionDate: sub.SubmissionDate,
      Submitted: sub.Submitted
    }));

    // Extract the user's FirstName/LastName from userQuery
    const userInfo = userQuery.recordset[0] || { FirstName: "", LastName: "" };

    // Respond with all data
    res.json({
      FirstName: userInfo.FirstName,
      LastName: userInfo.LastName,
      submissions,
      timeOffRecords: timeOffRecordsQuery.recordset,
      reportingPeriods: reportingPeriodsQuery.recordset
    });
  } catch (err) {
    console.error("Error fetching employee data:", err);
    res.status(500).json({ error: "Failed to fetch employee data" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
