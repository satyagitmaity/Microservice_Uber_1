const http = require("http")
const app = require("./app")
const connect = require("./db/db")

connect()
const server = http.createServer(app)
const port = process.env.PORT

server.listen(port,()=>{
    console.log(`Ride server is running on port ${port}`);
    
})