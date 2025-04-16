const express = require("express")
const dotenv = require("dotenv").config()
const cookieParser = require("cookie-parser")
const connect = require("./db/db")
const captainRoutes = require("./routes/captain.routes")
const RabbitMQ = require("./service/rabbit")
RabbitMQ.connect()
connect()
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.get("/",(req,res)=>{
    res.send("Server is running")
})
app.use("/", captainRoutes)


module.exports = app