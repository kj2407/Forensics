const express = require("express");
const router = express.Router();
const { getCases, getCaseById, createCase, updateCase, deleteCase } = require("../controllers/caseController");
const { protect } = require("../middleware/authMiddleware");

router.get("/",     protect, getCases);
router.get("/:id",  protect, getCaseById);
router.post("/",    protect, createCase);
router.put("/:id",  protect, updateCase);
router.delete("/:id", protect, deleteCase);

module.exports = router;