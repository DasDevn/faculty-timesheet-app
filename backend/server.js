const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors()); // Allow frontend to access API
app.use(express.json()); // Middleware to parse JSON

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true, 
  }
};

// Test database connection
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log("Connected to SQL Server!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}
connectDB(); // Run connection test

// API endpoint to fetch all submissions
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

// New API: Get all records by Employee ID
app.get('/api/employee/:employeeID', async (req, res) => {
  const { employeeID } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    // ✅ Fetch Time Report Submissions with Period
    const submissionsQuery = await pool.request()
      .input('EmployeeID', sql.NVarChar, employeeID)
      .query(`SELECT trs.SubmissionID, trs.EmployeeID, trs.PeriodID, 
                     CONVERT(VARCHAR, rp.StartDate, 23) AS StartDate, 
                     CONVERT(VARCHAR, rp.EndDate, 23) AS EndDate, 
                     CONVERT(VARCHAR, trs.SubmissionDate, 23) AS SubmissionDate, 
                     trs.Submitted
              FROM TimeReportSubmissions trs
              INNER JOIN ReportingPeriods rp ON trs.PeriodID = rp.PeriodID
              WHERE trs.EmployeeID = @EmployeeID`);

    console.log("Submissions Data:", submissionsQuery.recordset); // Debug log

    const timeOffRecords = await pool.request()
      .input('EmployeeID', sql.NVarChar, employeeID)
      .query("SELECT * FROM TimeOffRecords WHERE EmployeeID = @EmployeeID");

    const reportingPeriods = await pool.request()
      .input('EmployeeID', sql.NVarChar, employeeID)
      .query("SELECT * FROM ReportingPeriods WHERE PeriodID IN (SELECT PeriodID FROM TimeReportSubmissions WHERE EmployeeID = @EmployeeID)");

    const submissions = submissionsQuery.recordset.map(sub => ({
      SubmissionID: sub.SubmissionID,
      EmployeeID: sub.EmployeeID,
      Period: sub.StartDate && sub.EndDate ? `${sub.StartDate} - ${sub.EndDate}` : "N/A", // Handle missing dates
      SubmissionDate: sub.SubmissionDate,
      Submitted: sub.Submitted
    }));

    console.log("Processed Submissions:", submissions); // Debug log after formatting

    res.json({
      submissions,
      timeOffRecords: timeOffRecords.recordset,
      reportingPeriods: reportingPeriods.recordset
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
