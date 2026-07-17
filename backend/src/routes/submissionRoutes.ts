import { Router } from 'express';
import { executeCode, getSubmissions } from '../controllers/submissionController';

const router = Router();

router.post('/execute', executeCode);
router.get('/:problemId', getSubmissions);

export default router;
