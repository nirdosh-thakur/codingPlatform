const express = require('express')
const app = express();

require('dotenv').config();
const mongoDb_connect = require('./config/db');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');

app.use(express.json());  // Convert Request Body JSON -> JavaScript Object
app.use(cookieParser());  // Automatically parse the raw cookie string from headers.

app.use('/user', authRouter);







// Redis Db and Mongo Db Started 
const IntializeConnection = async () => {
    try{
        await Promise.all([mongoDb_connect(), redisClient.connect()])
        console.log("DB Connected");

        app.listen(process.env.PORT, ()=>{
            console.log("App Listening at Port "+ process.env.PORT);    
        })
    }
    catch(err){
        console.log("Error: " + err);
    }
}

IntializeConnection();
