const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware")
const probRateLimiter = require("../middleware/probRatelimiter")
const {submitCode, runCode} = require("../controllers/userSubmission")

submitRouter.post("/submit/:id", userMiddleware, probRateLimiter, submitCode);
submitRouter.post("/run/:id", userMiddleware, probRateLimiter, runCode);


module.exports = submitRouter;