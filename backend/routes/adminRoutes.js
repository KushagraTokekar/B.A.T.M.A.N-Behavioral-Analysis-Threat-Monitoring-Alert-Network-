const express = require("express");
const {
  getAllReportsAdmin,
  verifyReport,
  rejectReport,
  resolveReport,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/reports", authMiddleware, adminMiddleware, getAllReportsAdmin);
router.put("/reports/:id/verify", authMiddleware, adminMiddleware, verifyReport);
router.put("/reports/:id/reject", authMiddleware, adminMiddleware, rejectReport);
router.put("/reports/:id/resolve", authMiddleware, adminMiddleware, resolveReport);

module.exports = router;