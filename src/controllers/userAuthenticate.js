
const redisClient = require('../config/redis')
const User = require('../models/user') 
const validateUser = require('../utils/validatorUser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = async  (req, res) => {
    try{
        validateUser(req.body);

        // 2. Check if Email Id exist already or not.

        const {firstName, emailId, password} = req.body;
        req.body.password = await bcrypt.hash(password, 10);

        // Fixed that whoever comes here we make him 'user'
        req.body.role = 'user';
        const user = await User.create(req.body);

        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: 'user' },   // payload
            process.env.JWT_SECRET,                // secret key (stored in .env file)
            { expiresIn: 60 * 60 }                 // 1 hour expiry (3600 seconds)
        );

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,   // frontend JS can’t access it (helps prevent XSS)
        });

        res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: " + err);
    }
}

const login = async (req, res) => {
    try{
        // 1. Fetch emailId and Password from Req
        const {emailId, password} = req.body;

        // 2. Throw Error if either of these is empty
        if(!emailId || !password)
            throw new Error("Invalid Credentials");

        // 3. Find user in User Table
        const user = await User.findOne({emailId});
        
        // 4. Compare password with hash stored in DB
        const isMatch = await bcrypt.compare(password, user.password);

        // 5. Throw error if pwd didnt match 
        if (!isMatch)
            throw new Error("Invalid Credentials");

        // 6. Create JWT Token
        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: user.role },   // payload
            process.env.JWT_SECRET,                // secret key (stored in .env file)
            { expiresIn: 60 * 60 }                 // 1 hour expiry (3600 seconds)
        );

        // 7. Set Cookie for Token
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,   // frontend JS can’t access it (helps prevent XSS)
        });

        // 8. Send Final Response
        res.status(200).send("Logged In Successfully");
    }
    catch(err){
        res.status(401).send("Error :" + err);
    }
}

const logout = async (req, res) => {
    try{
        // 1. Validate the Token
        // 2. Put token in Redis
        // 3. Clear Cookies 

        const {token} = req.cookies;
        const payload = jwt.decode(token, process.env.JWT_SECRET);
        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, {expires: new Date(Date.now())});
        res.send("Logged out successfully");
    }
    catch(err){
        res.status(503).send("Error: " + err);
    }
}

const adminRegister = async(req, res) => {
     try{
        validateUser(req.body);

        const {firstName, emailId, password} = req.body;
        req.body.password = await bcrypt.hash(password, 10);

        // Fixed that whoever comes here we make him 'Admin'
        req.body.role = 'admin';

        const user = await User.create(req.body);

        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: 'user' },   // payload
            process.env.JWT_SECRET,                // secret key (stored in .env file)
            { expiresIn: 60 * 60 }                 // 1 hour expiry (3600 seconds)
        );

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,   // frontend JS can’t access it (helps prevent XSS)
        });

        res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: " + err);
    }
}

const myProfile = (req, res) => {
    
}


module.exports = {register, login, logout, adminRegister}; 