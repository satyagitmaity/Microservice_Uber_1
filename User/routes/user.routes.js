const express = require("express")
const { registerUser, loginUser, logoutUser, getProfile, acceptedRide } = require("../controller/user.controller")
const { validateToken } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/registerUser", registerUser)
router.post("/login", loginUser)
router.get("/logout", logoutUser)
router.get("/profile", validateToken, getProfile)
router.get("/acceptedRide", validateToken, acceptedRide)

module.exports = router