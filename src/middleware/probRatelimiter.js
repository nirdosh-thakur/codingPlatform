const redisClient = require('../config/redis')

const probRateLimiter = async (req, res, next) => {
    try{
        const userId = req.result._id;
        const redisKey = `submit_cooldown:${userId}`;

        // Check If user has a recent submission
        const exists = await redisClient.exists(redisKey);
        if(exists)
            return res.status(429).json({error: "Please wait for 10 sec before submitting again"});
        
        await redisClient.set(redisKey, 'cooldown_active', {
            EX: 10,   // Expire after 10 seconds
            NX: True  // Only set if not exists
        });
         
        next();
    }
    catch(error){
        console.error("Rate Limiter Error:", error);
        return res.status(500 ).json({error: "Internal Server Error"});
    }
}

module.exports = probRateLimiter;