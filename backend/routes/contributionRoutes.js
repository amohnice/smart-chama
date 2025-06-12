const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/auth");
const contributionController = require("../controllers/contributionController");

// Member routes
router.get("/my-contributions", auth, contributionController.getMemberContributions);
router.post("/contribute", auth, contributionController.makeContribution);

// Admin routes
router.get("/", auth, admin, contributionController.getAllContributions);
router.get("/stats", auth, admin, contributionController.getContributionStats);
router.post("/", auth, admin, contributionController.addContribution);
router.put("/:id", auth, admin, contributionController.updateContribution);
router.delete("/:id", auth, admin, contributionController.deleteContribution);
router.get("/export", auth, admin, contributionController.exportContributions);

module.exports = router;