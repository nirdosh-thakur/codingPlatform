const mongoose = require('mongoose')

async function mongoDb_connect(){
    await mongoose.connect(process.env.DB_CONNECT_STRING) 
}

module.exports = mongoDb_connect;