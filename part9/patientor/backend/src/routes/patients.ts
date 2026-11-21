import express, { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';

import patientsService from '../services/patientsService.ts';
import { NewPatientSchema, type NewPatient, type Patient } from '../types.ts';

const router = express.Router();

router.get('/', (_req, res) => {
    // getNonSensitiveEntries (non getEntries!) -> esclude ssn dalla risposta, vedi patientsService
    const data = patientsService.getNonSensitiveEntries();
    res.send(data);
});

// Middleware eseguito PRIMA dell'handler della POST (vedi dove viene passato sotto).
// Valida req.body contro NewPatientSchema; se non e' valido lancia e passa l'errore
// a next(error), che salta dritto a errorMiddleware (fine file) invece che all'handler.
const newPatientParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    NewPatientSchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

// Request<unknown, unknown, NewPatient>: il 3o parametro tipizza req.body.
// Possiamo "fidarci" che sia davvero un NewPatient solo perche' newPatientParser
// gira prima e garantisce che i dati non validi non arrivino mai qui.
router.post('/', newPatientParser, (req: Request<unknown, unknown, NewPatient>, res: Response<Patient>) => {
  const addedEntry = patientsService.addPatient(req.body);
  res.json(addedEntry);
});

// Error handler Express (4 argomenti = Express lo riconosce come tale).
// Se l'errore viene da Zod (validazione fallita in newPatientParser) risponde 400
// con la lista dettagliata dei problemi; altrimenti passa oltre con next(error).
const errorMiddleware = (error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).send({ error: error.issues });
  } else {
    next(error);
  }
};

// router.use (non app.use!): si applica solo alle rotte di QUESTO router,
// va messo dopo tutte le route che gestisce.
router.use(errorMiddleware);


export default router;