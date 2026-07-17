import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  problemTitle: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, required: true },
  code: { type: String, required: true },
  results: [{
    testCaseId: String,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    status: String,
    runtimeMs: Number,
    memoryKb: Number,
    error: String
  }],
  runtimeMs: { type: Number, default: 0 },
  memoryKb: { type: Number, default: 0 },
  solveTimeSeconds: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Submission = mongoose.model('Submission', submissionSchema);
