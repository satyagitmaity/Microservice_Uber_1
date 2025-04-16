const mongoose = require("mongoose")

function connect(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Ride service connected to mongodb");
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = connect