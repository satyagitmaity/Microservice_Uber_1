const express = require("express");
const dotenv = require("dotenv").config()
const cookieParser = require("cookie-parser")
const rideRoutes = require("./routes/ride.routes")
const RabbitMQ = require("./Service/rabbit")

RabbitMQ.connect()

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use("/", rideRoutes)
app.get("/",(req,res)=>{
    res.send("Ride server is running")
})
module.exports = app