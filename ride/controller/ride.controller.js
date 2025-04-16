const rideModel = require("../models/ride.models");
const { publishToQueue } = require("../Service/rabbit");

const createRide = async(req, res) =>{
    const {pickup, destination} = req.body;
    const newRide = new rideModel({
        user:req.user._id,
        pickup,
        destination
    });
    publishToQueue("new-ride", JSON.stringify(newRide))
    await newRide.save()
    res.status(201).json(newRide)
}

const acceptRide = async(req,res)=>{
    const {rideId} = req.query;
    const ride = await rideModel.findOne()
    if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
    }

    ride.status = 'accepted';
    await ride.save();
    publishToQueue("ride-accepted", JSON.stringify(ride))
    res.send(ride);
}

module.exports = {
    createRide,
    acceptRide
}