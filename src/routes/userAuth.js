const express = require('express');
const authRouter = express.Router();
const {register, login, logout, adminRegister} = require('../controllers/userAuthenticate');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister); 
//authRouter.get('/getProfile', getProfile);


module.exports = authRouter;
// 1. Register
// 2. Login
// 3. Logout
// 4. My Profile 
// 5. Email Verification
// 6. Reset Password
// 7. Forgot Password
// 8. Google Sign Up
// 9. OTP Verification