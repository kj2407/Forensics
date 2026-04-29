const mysql = require("mysql2");

const db = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASS     || "",
  database: process.env.DB_NAME     || "forensics_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection on startup
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected to forensics_db");
    connection.release();
  }
});

module.exports = db.promise(); // use promise-based API