const express = require("express");
const protect = require("../middleware/auth");
const { logWeight, getWeights, deleteWeight } = require("../controllers/weightController");

const router = express.Router();

router.use(protect);
router.post("/", logWeight);
router.get("/", getWeights);
router.delete("/:id", deleteWeight);

module.exports = router;
