const Problem = require('../models/problem')
const Submission = require('../models/submission')
const {getLanguageById, submitBatch, submitToken} = require('../utils/problemUtility')

const submitCode = async (req, res) => {
    try{
        // Fetch User Id from Req, added by MiddleWare
        const userId = req.result._id;
        // Fetch problemId from params (as user has solved problem, it must have some id)
        const problemId = req.params.id;

        // Fetch code,language from Req body
        const {code, language} = req.body;

        // If anything not present return "missing status"
        if(!userId) return res.status(400).send("Some field missing at User");
        if(!code || ! problemId || !language) return res.status(400).send("Some field missing");

        // Fetch the problem from the Database, based on problem Id
        const problem = await Problem.findById(problemId);

        // Storing 'pending' status in DB in Submissions, for now
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        })

        // Gettting Id from string, by calling user defined getLanguageById function
        const languageId = getLanguageById(language);
        
        // We make a submissions array, for each testcase put values angaist parameters
        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
        
        // Calling Judge0 Api to send our batch of code for scanning, it will give us token instantly.
        const submitResult = await submitBatch(submissions);

        // Fetching token in a array form
        const resultToken = submitResult.map((val) => val.token);

        // Calling Judge0 Api, to check the status of tokens, it will keep scanning until it get any form of status id
        const testResult = await submitToken(resultToken)


        let testCasesPassed = 0;
        let runTime = 0;
        let memory = 0;
        let statusMessage = 'accepted';
        let errorMessage = null;

        // Checking for each testResult, how much have passed, and then calculating time and memory
        for(const test of testResult){
            if(test.status_id == 3){
                testCasesPassed++;
                runTime += parseFloat(test.time);
                memory +=  Math.max(memory, test.memory);
            }
            else{
                if(test.status_id == 4){
                    statusMessage = 'error'; 
                    errorMessage = test.stdrr;
                }
                else{
                    statusMessage = 'wrong result';
                    errorMessage = test.stdrr;
                }
            }
        }

        // Store the result in Database in Submission
        submittedResult.status = statusMessage;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runTime;
        submittedResult.memory = memory;

        await submittedResult.save();

        // req.result = user information
        // Saving the problem in User Schema in problemSolved area, if it is frist time he solved this problem
        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push (problemId);
            await  req.result.save(); 
        }

        // Sending API response back
        res.status(201).send(submittedResult);
    }
    catch(err){
        console.log("Error"+err);
        res.status(500).send("Internal Server Error"+ err);
    }

}

const runCode = async (req, res) => {
    try{
        // Fetch User Id from Req, added by MiddleWare
        const userId = req.result._id;
        // Fetch problemId from params (as user has solved problem, it must have some id)
        const problemId = req.params.id;

        // Fetch code,language from Req body
        const {code, language} = req.body;

        // If anything not present return "missing status"
        if(!userId) return res.status(400).send("Some field missing at User");
        if(!code || ! problemId || !language) return res.status(400).send("Some field missing");

        // Fetch the problem from the Database, based on problem Id
        const problem = await Problem.findById(problemId);
 

        // Gettting Id from string, by calling user defined getLanguageById function
        const languageId = getLanguageById(language);
        
        // We make a submissions array, for each testcase put values angaist parameters
        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
        
        // Calling Judge0 Api to send our batch of code for scanning, it will give us token instantly.
        const submitResult = await submitBatch(submissions);

        // Fetching token in a array form
        const resultToken = submitResult.map((val) => val.token);

        // Calling Judge0 Api, to check the status of tokens, it will keep scanning until it get any form of status id
        const testResult = await submitToken(resultToken); 

        // Sending API response back
        res.status(201).send(testResult);
    }
    catch(err){
        console.log("Error"+err);
        res.status(500).send("Internal Server Error"+ err);
    }
}

module.exports = {submitCode, runCode}