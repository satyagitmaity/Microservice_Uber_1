const express = require("express")
const { registerCaptain, loginCaptain, logoutCaptain, getProfile, toggleAvailablity, waitForNewRide } = require("../controller/captain.controller")
const { validateToken } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/registerCaptain", registerCaptain)
router.post("/login", loginCaptain)
router.get("/logout", logoutCaptain)
router.get("/profile", validateToken, getProfile)
router.patch("/toggleAvailablity", validateToken, toggleAvailablity)
router.get("/newRide", validateToken, waitForNewRide)

module.exports = router