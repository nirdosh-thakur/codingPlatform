const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis')


// From token we verify - whether valid token or not
const adminMiddleware = async (req, res, next)  => {
    console.log("admin Middleware")
    try{
        const {token} = req.cookies;
        if(!token) 
            throw new Error("Token is not present");

        const payload = await jwt.verify(token, process.env.JWT_SECRET); 

        if (payload.role != 'admin')
            throw new Error("Invalid token")

        const {_id} = payload;
        if (!_id) 
            throw new Error("Invalid token !");

        const result = await User.findById(_id); 
        if(!result) throw new Error("User dosen't exist.");

        // Check in Redis - if the token is blocked there or not
        const isBlockedByRedis = await redisClient.exists(`token:${token}`);
        if (isBlockedByRedis) 
            throw new Error("Invalid token");

        // Added to USer
        req.result = result;
        next();

    }
    catch(error){
        console.log("Failed in admin MiddleWare");
        res.status(401 ).send("Error: "+ error);
    }
}


module.exports = adminMiddleware;