const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, role, last_login FROM User_Account ORDER BY user_id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, role, last_login FROM User_Account WHERE user_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { role } = req.body;
    await db.query("UPDATE User_Account SET role=? WHERE user_id=?", [role, req.params.id]);
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await db.query("DELETE FROM User_Account WHERE user_id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;