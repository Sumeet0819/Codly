import { Router } from 'express';
import { getProblems, getProblemById, createProblem } from '../controllers/problemController';

const router = Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', createProblem);

export default router;
