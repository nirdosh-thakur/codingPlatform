const express = require('express')



const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/getProfile', getProfile);

// 1. Register
// 2. Login
// 3. Logout
// 4. My Profile 
// 5. Email Verification
// 6. Reset Password
// 7. Forgot Password
// 8. Google Sign Up
// 9. OTP Verification