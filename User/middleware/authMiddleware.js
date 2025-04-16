const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model")
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
    const blacklistToken = await blacklistTokenModel.findOne({token})
    
    if(blacklistToken){
       return res.status(401).json({message:"Unauthorized access..."})
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    
    const user = await userModel.findById(decoded.id)
    if(!user){
        return res.status(401).json({message:"Unauthorized access..."})
    }
    req.user = user
    next()
}catch(error){
    return res.status(500).json({error:error.message})
}
}
module.exports = {genToken, validateToken}