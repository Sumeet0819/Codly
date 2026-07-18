import { Router } from 'express';
import { executeCode, getSubmissions, getAllSubmissions } from '../controllers/submissionController';

const router = Router();

router.post('/execute', executeCode);
router.get('/', getAllSubmissions);
router.get('/:problemId', getSubmissions);

export default router;
