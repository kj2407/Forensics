const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", protect, async (req, res) => {
  try {
    const [[{ totalCases }]]     = await db.query("SELECT COUNT(*) as totalCases FROM `Case_Table`");
    const [[{ openCases }]]      = await db.query("SELECT COUNT(*) as openCases FROM `Case_Table` WHERE Status='Open'");
    const [[{ closedCases }]]    = await db.query("SELECT COUNT(*) as closedCases FROM `Case_Table` WHERE Status='Closed'");
    const [[{ pendingCases }]]   = await db.query("SELECT COUNT(*) as pendingCases FROM `Case_Table` WHERE Status='Pending'");
    const [[{ totalEvidence }]]  = await db.query("SELECT COUNT(*) as totalEvidence FROM `Evidence`");
    const [[{ totalReports }]]   = await db.query("SELECT COUNT(*) as totalReports FROM `Analysis_Report`");
    const [[{ totalUsers }]]     = await db.query("SELECT COUNT(*) as totalUsers FROM `User_Account`");
    const [[{ pendingReports }]] = await db.query("SELECT COUNT(*) as pendingReports FROM `Analysis_Report` WHERE status='Pending'");

    const [recentCases] = await db.query(
      "SELECT Case_ID, Case_No, Status, Priority FROM `Case_Table` ORDER BY Case_ID DESC LIMIT 5"
    );

    res.json({
      totalCases, openCases, closedCases, pendingCases,
      totalEvidence, totalReports, totalUsers, pendingReports,
      recentCases
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;