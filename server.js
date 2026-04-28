const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API running...");
});

// Start server
const PORT = process.env.PORT || 5000;

const caseRoutes = require("./routes/caseRoutes");
app.use("/api/cases", caseRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
