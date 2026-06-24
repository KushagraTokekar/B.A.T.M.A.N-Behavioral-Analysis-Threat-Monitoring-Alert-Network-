const express = require("express");
const {
  createReport,
  getAllReports,
  getMyReports
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createReport);
router.get("/", getAllReports);
router.get("/my", authMiddleware, getMyReports);

module.exports = router;