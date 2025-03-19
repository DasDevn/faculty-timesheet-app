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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
