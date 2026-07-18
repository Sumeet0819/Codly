import { Request, Response } from 'express';
import { Problem } from '../models/Problem';

export const getProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getProblemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(problem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = new Problem(req.body);
    const saved = await problem.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) { res.status(404).json({ error: 'Not found' }); return; }
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
