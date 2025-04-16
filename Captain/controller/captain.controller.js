const { genToken } = require("../middleware/authMiddleware");
const captainModel = require("../models/captain.model");
const blacklistTokenModel = require("../models/blacklistToken.model")
const bcrypt = require("bcrypt");
const { subscribeToQueue } = require("../service/rabbit");

const pendingRequests = [];

const registerCaptain = async(req,res)=>{
    try {
        const {name,email,password} = req.body;
        
        if(!name||!email||!password){
           return res.status(400).json({message:"Please provide all required fields."})
        }
        const captain = await captainModel.findOne({email})
        if(captain) {
            return res.status(400).json({message:"captain already exists with this email."})
        }
        
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newcaptain = await captainModel.create({
            name,
            email,
            password:hashedPassword
        })
        const token = genToken({id:newcaptain._id})
        const captainObj = newcaptain.toObject()
        delete captainObj.password
        res.cookie("token",token)
        res.status(200).json({token, newcaptain:captainObj})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const loginCaptain = async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
            res.status(400).json({message:"Please provide email and password"})
        }
        const captain = await captainModel.findOne({email}).select("password")
        if(!captain){
            return res.status(400).json({message:"captain not found"})
        }
        const isMatch = await bcrypt.compare(password, captain.password)
        if(!isMatch){
           return res.status(400).json({message:"Password mismatched."})
        }
        const token = genToken({id:captain._id});
        delete captain._doc.password
        res.cookie("token",token);
        res.status(200).json({message:"captain logged in successfully.", token})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const logoutCaptain = async(req,res)=>{
    try {
        const token = req.cookies.token;
        await blacklistTokenModel.create({token})
        res.clearCookie("token")
        res.status(200).json({message:"captain logged out successfully."})
    } catch (error) {
        res.status(500).json({message:error.message})

    }
}

const getProfile = async(req,res)=>{
    try {
        res.send(req.captain)
    } catch (error) {
        res.status(500).json({message:error.message, stack: error.stack})
    }
}

const toggleAvailablity = async(req,res)=>{
    try {
        const captain = await captainModel.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable;
        await captain.save()
        res.send(captain)
    } catch (error) {
        res.status(500).json({message:error.message, stack: error.stack})
    }
}

const waitForNewRide = async (req, res) => {
    // Set timeout for long polling (e.g., 30 seconds)
    req.setTimeout(30000, () => {
        res.status(204).end(); // No Content
    });

    // Add the response object to the pendingRequests array
    pendingRequests.push(res);
};

subscribeToQueue("new-ride", (data) => {
    const rideData = JSON.parse(data);

    // Send the new ride data to all pending requests
    pendingRequests.forEach(res => {
        res.json({data:rideData});
    });

    // Clear the pending requests
    pendingRequests.length = 0;
});



module.exports = {
    registerCaptain,
    loginCaptain,
    logoutCaptain, 
    getProfile,
    toggleAvailablity,
    waitForNewRide
}