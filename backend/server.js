const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => res.send("ForensIQ API running..."));

// Routes
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/cases",    require("./routes/caseRoutes"));
app.use("/api/evidence", require("./routes/evidenceRoutes"));
app.use("/api/reports",  require("./routes/reportRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/dashboard",require("./routes/dashboardRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));