// diagnosis e' dati statici (file .ts, non .json) scaricati dal materiale del corso,
// gia' tipizzati implicitamente: niente database, tutto in memoria.
import diagnosis from '../../data/diagnoses.ts';

import type { DiagnosisEntry } from '../types.ts';

const getEntries = (): DiagnosisEntry[]  => {
  return diagnosis;
};

const addDiagnosis = () => {
  return null; // non implementato, vedi routes/diagnoses.ts
};

export default {
  getEntries,
  addDiagnosis
};