const db = require("../config/db");

// GET /api/cases
const getCases = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, l.building_name, l.room_no 
       FROM Case_Table c 
       LEFT JOIN Location l ON c.location_id = l.location_id
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("getCases error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/cases/:id
const getCaseById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, l.building_name, l.room_no 
       FROM Case_Table c 
       LEFT JOIN Location l ON c.location_id = l.location_id
       WHERE c.case_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Case not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getCaseById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/cases
const createCase = async (req, res) => {
  try {
    const { case_no, status, priority, location_id } = req.body;
    if (!case_no) return res.status(400).json({ message: "case_no is required" });

    const [result] = await db.query(
      `INSERT INTO Case_Table (case_no, status, priority, location_id) VALUES (?, ?, ?, ?)`,
      [case_no, status || "Open", priority || "Medium", location_id || null]
    );
    res.status(201).json({
      case_id: result.insertId,
      case_no,
      status: status || "Open",
      priority: priority || "Medium",
    });
  } catch (err) {
    console.error("createCase error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/cases/:id
const updateCase = async (req, res) => {
  try {
    const { case_no, status, priority, location_id } = req.body;
    await db.query(
      `UPDATE Case_Table 
       SET case_no = ?, status = ?, priority = ?, location_id = ?, version = version + 1 
       WHERE case_id = ?`,
      [case_no, status, priority, location_id || null, req.params.id]
    );
    res.json({ message: "Case updated successfully" });
  } catch (err) {
    console.error("updateCase error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/cases/:id
const deleteCase = async (req, res) => {
  try {
    await db.query(`DELETE FROM Case_Table WHERE case_id = ?`, [req.params.id]);
    res.json({ message: "Case deleted successfully" });
  } catch (err) {
    console.error("deleteCase error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getCases, getCaseById, createCase, updateCase, deleteCase };