import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  examples: [{ input: String, output: String, explanation: String }],
  constraints: [String],
  notes: String,
  methodName: String,
  starterCode: { type: Map, of: String },
  publicTestCases: [{ input: String, expectedOutput: String }],
  hiddenTestCases: [{ input: String, expectedOutput: String, hidden: Boolean }],
  solution: String,
  explanation: String,
  complexity: { time: String, space: String },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  solvedAt: { type: Date },
  source: { type: String, default: 'ai' }
});

export const Problem = mongoose.model('Problem', problemSchema);
