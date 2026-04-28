const express = require("express");
const router = express.Router();

const {
  getCases,
  createCase
} = require("../controllers/caseController");

router.get("/", getCases);
router.post("/", createCase);

module.exports = router;