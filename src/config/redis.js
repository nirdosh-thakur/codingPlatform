const { createClient } = require('redis')

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19515.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 19515
    }
});

module.exports = redisClient;