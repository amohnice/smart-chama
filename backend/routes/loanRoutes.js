const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/auth");
const loanController = require("../controllers/loanController");

// Member routes
router.post("/apply", auth, loanController.applyForLoan);
router.get("/my-loans", auth, loanController.getMemberLoans);
router.post("/:id/repay", auth, loanController.repayLoan);
router.get("/:id", auth, loanController.getLoanById);

// Admin routes
router.get("/", auth, admin, loanController.getAllLoans);
router.post("/", auth, admin, loanController.createLoan);
router.put("/:id", auth, admin, loanController.updateLoan);
router.post("/:id/approve", auth, admin, loanController.approveLoan);
router.post("/:id/reject", auth, admin, loanController.rejectLoan);
router.delete("/:id", auth, admin, loanController.deleteLoan);
router.get("/export", auth, admin, loanController.exportLoans);

module.exports = router;