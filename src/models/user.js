const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{type:String, require:true, minLength:2, maxLength:20},
    lastName:{type:String, minLength: 2, maxLength:20 },
    emailId: {type:String, required:true, unique:true, trim:true, lowercase:true, immutable:true},
    age: {type:Number, min:10, max:80},
    role: {type:String, enum:['user', 'admin'], default: 'user'},
    problemSolved: {
        type:[{
            type: Schema.Types.ObjectId,
            ref: 'problem',
        }],
        unique:true
    },
    password:{type:String, required:true}
},
{
    timestamps:true,
})

// Condition:findONeAndDelete
// This will work when the condition will be there, then after user delteion from userSchema it will delte from submission too
// Pre and Post two sitatution wher to delete
userSchema.post('findOneAndDelete', async function(userInfo){
    if(userInfo){
        await mongoose.model('submission',deleteMany({userId: userInfo._id}))
    }
})


const User = mongoose.model("user", userSchema);
module.exports = User; 