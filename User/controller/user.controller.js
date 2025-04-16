const { genToken } = require("../middleware/authMiddleware");
const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model")
const bcrypt = require("bcrypt");
const EventEmitter = require('events');
const rideEventEmitter = new EventEmitter();
const { subscribeToQueue } = require("../../ride/Service/rabbit");

const registerUser = async(req,res)=>{
    try {
        const {name,email,password} = req.body;
        
        if(!name||!email||!password){
           return res.status(400).json({message:"Please provide all required fields."})
        }
        const user = await userModel.findOne({email})
        if(user) {
            return res.status(400).json({message:"User already exists with this email."})
        }
        
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = await userModel.create({
            name,
            email,
            password:hashedPassword
        })
        const token = genToken({id:newUser._id})
        const userObj = newUser.toObject()
        delete userObj.password
        res.cookie("token",token)
        res.status(200).json({token, newUser:userObj})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const loginUser = async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
            res.status(400).json({message:"Please provide email and password"})
        }
        const user = await userModel.findOne({email}).select("password")
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
           return res.status(400).json({message:"Password mismatched."})
        }
        const token = genToken({id:user._id});
        delete user._doc.password
        res.cookie("token",token);
        res.status(200).json({message:"User logged in successfully.", token})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const logoutUser = async(req,res)=>{
    try {
        const token = req.cookies.token;
        await blacklistTokenModel.create({token})
        res.clearCookie("token")
        res.status(200).json({message:"User logged out successfully."})
    } catch (error) {
        res.status(500).json({message:error.message})

    }
}

const getProfile = async(req,res)=>{
    try {
        res.send(req.user)
    } catch (error) {
        res.status(500).json({message:error.message, stack: error.stack})
    }
}

const acceptedRide = async (req, res) => {
    // Long polling: wait for 'ride-accepted' event
    rideEventEmitter.once('ride-accepted', (data) => {
        res.send(data);
    });

    // Set timeout for long polling (e.g., 30 seconds)
    setTimeout(() => {
        res.status(204).send();
    }, 30000);
}

subscribeToQueue('ride-accepted', async (msg) => {
    const data = JSON.parse(msg);
    rideEventEmitter.emit('ride-accepted', data);
});


module.exports = {
    registerUser,
    loginUser,
    logoutUser, 
    getProfile,
    acceptedRide
}