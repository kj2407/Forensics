const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, c.case_no, d.dept_name
       FROM Analysis_Report r
       LEFT JOIN Cases c ON r.case_id = c.case_id
       LEFT JOIN Department d ON r.dept_id = d.dept_id
       ORDER BY r.generated_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, c.case_no, d.dept_name FROM Analysis_Report r
       LEFT JOIN Cases c ON r.case_id = c.case_id
       LEFT JOIN Department d ON r.dept_id = d.dept_id
       WHERE r.report_id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Report not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { case_id, dept_id, content } = req.body;
    const [result] = await db.query(
      "INSERT INTO Analysis_Report (case_id, dept_id, content) VALUES (?,?,?)",
      [case_id, dept_id || null, content]
    );
    res.status(201).json({ report_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { content } = req.body;
    await db.query("UPDATE Analysis_Report SET content=? WHERE report_id=?", [content, req.params.id]);
    res.json({ message: "Report updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await db.query("DELETE FROM Analysis_Report WHERE report_id = ?", [req.params.id]);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;