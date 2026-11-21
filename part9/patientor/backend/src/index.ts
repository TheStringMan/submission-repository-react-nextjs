import express from 'express';
import cors from 'cors';

import diagnosesRouter from './routes/diagnoses.ts';
import patientsRouter from './routes/patients.ts';

const app = express();
app.use(express.json());
app.use(cors()); // frontend gira su :5173, backend su :3001 -> richieste cross-origin, senza questo il browser le blocca

const PORT = 3001; // deve combaciare con apiBaseUrl nel frontend (src/constants.ts)

app.get('/api/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.use('/api/diagnoses', diagnosesRouter);
app.use('/api/patients', patientsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});