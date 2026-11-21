import { z } from 'zod';

export interface DiagnosisEntry {
  code: string;
  name: string;
  latin?: string;
}

// "as const object": Gender esiste sia come valore reale a runtime (usato da z.enum/Object.values)
// sia come tipo (sotto) - a differenza di un normale union type, qui i valori ammessi
// restano sincronizzati in un unico posto. Preferito a un enum TS vero e proprio
// (vedi capitolo 4 del corso: gli enum generano codice a runtime problematico con lo "stripping" di Node).
export const Gender = {
  Male: 'male',
  Female: 'female',
  Other: 'other',
} as const;

export type Gender = typeof Gender[keyof typeof Gender]; // -> 'male' | 'female' | 'other'

export type NonSensitivePatient = Omit<Patient, 'ssn'>; // versione per GET /api/patients: niente ssn in giro

// Il tipo NewPatient viene DEDOTTO dallo schema Zod sottostante (non il contrario):
// se cambi lo schema, il tipo si aggiorna da solo, zero duplicazione.
export type NewPatient = z.infer<typeof NewPatientSchema>;

export interface Patient extends NewPatient {
  id: string; // generato lato server con uuid quando si crea il paziente, non arriva dal client
}

// Schema di validazione per il body di POST /api/patients (vedi routes/patients.ts -> newPatientParser).
// IMPORTANTE: sta qui in types.ts (non in un file separato tipo utils.ts) perché usa Gender,
// e Gender+NewPatient+NewPatientSchema si richiamano a vicenda: tenerli in file diversi
// crea un import circolare che a runtime da' "ReferenceError: Cannot access 'Gender' before initialization".
export const NewPatientSchema = z.object({
  name: z.string(),
  dateOfBirth: z.string(),
  ssn: z.string(),
  gender: z.enum(Gender),
  occupation: z.string(),
});