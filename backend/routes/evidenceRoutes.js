const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, et.type_name, et.category, o.full_name as officer_name, c.case_no
       FROM Evidence e
       LEFT JOIN Evidence_Type et ON e.type_id = et.type_id
       LEFT JOIN Officer o ON e.officer_id = o.officer_id
       LEFT JOIN Cases c ON e.case_id = c.case_id
       ORDER BY e.evidence_id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, et.type_name, o.full_name as officer_name, c.case_no
       FROM Evidence e
       LEFT JOIN Evidence_Type et ON e.type_id = et.type_id
       LEFT JOIN Officer o ON e.officer_id = o.officer_id
       LEFT JOIN Cases c ON e.case_id = c.case_id
       WHERE e.evidence_id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Evidence not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { case_id, type_id, officer_id, description, collection_date, hash_value } = req.body;
    const [result] = await db.query(
      "INSERT INTO Evidence (case_id, type_id, officer_id, description, collection_date, hash_value) VALUES (?,?,?,?,?,?)",
      [case_id, type_id, officer_id, description, collection_date, hash_value]
    );
    res.status(201).json({ evidence_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { description, hash_value } = req.body;
    await db.query(
      "UPDATE Evidence SET description=?, hash_value=?, version=version+1 WHERE evidence_id=?",
      [description, hash_value, req.params.id]
    );
    res.json({ message: "Evidence updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await db.query("DELETE FROM Evidence WHERE evidence_id = ?", [req.params.id]);
    res.json({ message: "Evidence deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;