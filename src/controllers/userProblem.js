 const {getLanguageById, submitBatch, submitToken} = require('../utils/problemUtility');
 const Problem = require('../models/problem');
 const User = require('../models/user');

const createProblem = async (req, res) => {
    const {title, description, difficulty, tags, 
        visibleTestCases, hiddenTestCases, startCode, 
        referenceSolution, problemCreator} = req.body;

    try{
        for (const{language, completeCode} of referenceSolution){
            // Source Code
            // Language Id
            // Stdin
            // Expected output

            const language_id = getLanguageById(language);

            // I am creating Batch Submission 
            const submissions = visibleTestCases.map((testCases)=>({
                language_id: language_id,
                source_code: completeCode,
                stdin: testCases.input,
                expected_output: testCases.output
            }));

            const submitResult = await submitBatch(submissions);

            const resultToken = submitResult.map((val) => val.token);

            const testResult = await submitToken(resultToken)

            for( const test of testResult){
                if(test.status_id != 3){
                    return res.status(400).send("Error Occurred on " + test);
                }
            }
        }
        console.log("All Test Cases Passed");
        // Now we can store it in our DB 
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id // earlier in the request lifecycle ( authentication middleware) has already set req.result with the logged-in user’s info.
        })

        res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }

}

const updateProblem = async (req, res) => {
    console.log("Starting First command")
    const {id} = req.params;
    const {title, description, difficulty, tags, 
        visibleTestCases, hiddenTestCases, startCode, 
        referenceSolution, problemCreator} = req.body;
    console.log("Starting Update Fucntion")
    try{
        // 1. Check If Id is not Null
        if(!id) return res.status(400).send("Missing Id Field")
        
        // 2. Check if Id exist in Problem Collections in DB
        const DSAProblem = await Problem.findById(id);
        if(!DSAProblem) return res.status(404).send("ID is not present in server")
        
        // 3. For each referenceSolution check if code valid for all
        for (const{language, completeCode} of referenceSolution){

            // 4a. Fetch language Id
            const language_id = getLanguageById(language);

            // 4b. Create a batch for all test cases for this particular language
            const submissions = visibleTestCases.map((testCases)=>({
                language_id: language_id,
                source_code: completeCode,
                stdin: testCases.input,
                expected_output: testCases.output
            }));

            // 4c. API call to judge0 to get token
            const submitResult = await submitBatch(submissions);

            // 4d. Fetch token and make a list of that
            const resultToken = submitResult.map((val) => val.token);

            // 4e. API call to judge0 to check status of code sent earlier.
            const testResult = await submitToken(resultToken)

            // 4f. Check what result of code executed by judge0
            for( const test of testResult){
                if(test.status_id != 3){
                    res.status(400).send("Error Occurred on " + test);
                }
            }
        }
        console.log("All Test Cases Passed, can update DB Now");
        
        const updatedProblem = await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators: true, new: true});

        res.status(200).send(updatedProblem);
    }
    catch(err){
        res.status(500).send("Error: "+err);
    }
}

const deleteProblem = async (req, res) => {
    const {id} = req.params;
    try{
        // 1. Check If Id is not Null
        if(!id) return res.status(400).send("Missing Id Field")
        
        // 2. Delete from DB
        const deletedProblem = await Problem.findByIdAndDelete(id)

        // 3. If deleteProblem is empty/undefined, mean id not present in DB
        if(!deletedProblem) res.status(404).send("Problem is missing");

        res.status(200).send("Successfully deleted");

    }
    catch(err){
        res.status(500).send("Error :"+err);
    }
}

const getProblemById = async(req,res)=>{
    const {id} = req.params;
    try{
        if(!id) return res.status(400).send("ID is Missing");
        const getProblem = await Problem.findById(id).select('_id title description difficulty visibleTestCases startCode referenceSolution')
        if(!getProblem) return res.status(404).send("Problem is Missing");
        res.status(200).send(getProblem);
    }
    catch(err){
        res.status(500).send("Error: "+err);
    }
}

const getAllProblem = async (req, res) => {
    try{
        // Apply pagination
        // --------------  from url : page2limit10
        // page = 2
        // limit = 10
        // skip = (page-1) * limit
        
        // const allProblems = await Problem.find({})
        //                                          .skip(skip)
        //                                          .limit(limit)
         
        // For filters -
        // const allProblems = await Problem.find(
        //                                       {difficulty: 'easy'},
        //                                       {tags: 'array"}
        //                     ) 

        // 1. Found problem in DB
        const allProblems = await Problem.find({}).select('_id title difficulty tags')

        // 2. If  is empty/undefined, mean id not present in DB, it will return {}
        if(allProblems.length == 0) res.status(404).send("Problem are missing");

        // 3. Return all problems
        res.status(200).send(allProblems);

    }
    catch(err){
        res.status(500).send("Error :"+err);
    }
}

const solvedAllProblemByUser = async (req, res) => {
    try{
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        })
        const count = req.result.problemSolved.length;
        res.status(200).send(user.problemSolved);
    }
    catch{
        res.ststus(500).send("Server Error");
    }
}

const submittedProblem = async (req, res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.pId;
        
        const ans = await Submissions.find({userId, problemId});
        if(ans.length==0)
            req.status(200 ).send("No Submission is present")

        res.status(200).send(ans);
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
}


module.exports = {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem}; 