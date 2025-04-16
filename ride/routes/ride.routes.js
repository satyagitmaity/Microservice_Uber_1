const express = require("express");
const { userAuth, captainAuth } = require("../middleware/authMiddleware");
const { createRide, acceptRide } = require("../controller/ride.controller");

const router = express.Router();

router.post("/createRide",userAuth, createRide)
router.put("/acceptRide", captainAuth, acceptRide)
module.exports = router;