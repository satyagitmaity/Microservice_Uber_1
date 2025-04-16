const jwt = require("jsonwebtoken");
const captainModel = require("../models/captain.model")
const blacklistTokenModel = require("../models/blacklistToken.model")
const genToken= ({id})=>{
    return jwt.sign({id},process.env.JWT_SECRET, {expiresIn:"2h"})
}

const validateToken = async(req,res,next) =>{
    try{
        const token = req.cookies.token || req.headers.authorization.split(" ")[1]
    if(!token){
        return res.status(401).json({message:"Unauthorize access"})
    }
    const blacklistToken = await blacklistTokenModel.findOne({token});
    if(blacklistToken){
     return res.status(401).json({message:"Unauthorized access"})
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    
    const captain = await captainModel.findById(decoded.id)
    if(!captain){
        return res.status(401).json({message:"Unauthorized access..."})
    }
    req.captain = captain
    next()
}catch(error){
    return res.status(500).json({error:error.message})
}
}
module.exports = {genToken, validateToken}