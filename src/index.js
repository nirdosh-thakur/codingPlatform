const express = require('express')
const app = express();

require('dotenv').config();
const main = require('./config/db')
const cookieParser = require('cookie-parser')

// Convert Request Body JSON -> JavaScript Object
app.use(express.json());
 
// Automatically parse the raw cookie string from headers.
app.use(cookieParser());

main()
    .then(async () => {
        app.listen(process.env.PORT, ()=>{
            console.log("App Listening at Port "+ process.env.PORT);    
        })
    })
    .catch(err => console.log("Error Occured" + err));

