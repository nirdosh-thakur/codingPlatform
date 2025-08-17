
const User = require('../models/user') 
const validateUser = require('../utils/validatorUser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = async  (req, res) => {
    try{
        // 1. Validate the Data
        validateUser(req.body);

        // 2. Check if Email Id exist already or not.


        const {firstName, emailId, password} = req.body;
        // 3. Hashing password
        req.body.password = await bcrypt.hash(password, 10);
        
        // 4. User Creation
        const user = await User.create(req.body);

        // 5. JWT Token
        const token = jwt.sign(
            { _id: user._id, emailId: emailId },   // payload
            process.env.JWT_SECRET,                // secret key (stored in .env file)
            { expiresIn: 60 * 60 }                 // 1 hour expiry (3600 seconds)
        );

        // 6. Set and send Cookie to User
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,   // frontend JS can’t access it (helps prevent XSS)
        });

        // 7. Send Final Response
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
            { _id: user._id, emailId: emailId },   // payload
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
        
    }
    catch(err){
        res.status().send("Error :" + err)
    }
}

const myProfile = (req, res) => {
    
}