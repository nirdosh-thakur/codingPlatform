const adminMiddleware  = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem} = require('../controllers/userProblem');

const express = require('express');
const problemRouter = express.Router();



// Admin access needed
problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.put('/update/:id', adminMiddleware,  updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);

// Normal access needed
problemRouter.get('/problemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getAllProblem', userMiddleware, getAllProblem);
problemRouter.get('/problemSolvedByUser', userMiddleware, solvedAllProblemByUser);
problemRouter.get('/submittedProblem:pId', userMiddleware, submittedProblem);

module.exports =  problemRouter;