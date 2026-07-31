const express = require("express");
const { addExercise, getExercisesByDate, getExerciseHistory, deleteExercise } = require("../controllers/exerciseController");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/", addExercise);
router.get("/", getExercisesByDate);
router.get("/history", getExerciseHistory);
router.delete("/:id", deleteExercise);

module.exports = router;
