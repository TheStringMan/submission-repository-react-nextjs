import express from 'express';
import diagnosisService from '../services/diagnosisService.ts';

const router = express.Router();

router.get('/', (_req, res) => {
    const data = diagnosisService.getEntries();
    res.send(data);
});

router.post('/', (_req, res) => {
    // stub non implementato: nessun esercizio del capitolo chiede di creare diagnosi
    res.send('Saving a diagnosis!');
});

export default router;