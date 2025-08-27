const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'user', required: true },
  problemId: {type: Schema.Types.ObjectId, ref: 'problem', required: true},
  code: {type: String, required: true},
  language: {type: String, required: true, enum: ['javascript', 'C++', 'java','python'] },
  status: {type: String, enum: ['pending', 'accepted', 'wrong', 'error'], default: 'pending'},
  runtime: {type: Number, default: 0 },  //milllisecond
  memory: { type: Number, default: 0 },  // KB
  errorMessage: {type: String, default: ''},
  testCasesPassed: {type: Number,default: 0},
  testCasesTotal: {type: Number, default: 0}
}, 
{ 
  timestamps: true
});


const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission