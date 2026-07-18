import { Router } from 'express';
import { getProblems, getProblemById, createProblem, deleteProblem } from '../controllers/problemController';

const router = Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', createProblem);
router.delete('/:id', deleteProblem);

export default router;
