import patients from '../../data/patients.ts';
import { v1 as uuid } from 'uuid';

import type { Patient, NonSensitivePatient, NewPatient } from '../types.ts';

const getEntries = (): Patient[]  => {
  return patients;
};

// Il .map() qui e' essenziale: il TIPO NonSensitivePatient esclude ssn, ma senza
// ricostruire l'oggetto a mano i dati reali conterrebbero ssn lo stesso
// (TypeScript controlla i tipi, non filtra i valori a runtime).
const getNonSensitiveEntries = (): NonSensitivePatient[] => {
  return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
    id,
    name,
    dateOfBirth,
    gender,
    occupation
  }));
};

// patient arriva gia' validato da Zod (routes/patients.ts), qui ci si fida e basta.
const addPatient = (patient: NewPatient): Patient => {
  const newPatientEntry = {
    id: uuid(), // v1 = uuid basato su timestamp, basta che sia univoco
    ...patient
  };

  patients.push(newPatientEntry); // modifica l'array in memoria, si perde al riavvio del server
  return newPatientEntry;
};

export default {
  getEntries,
  getNonSensitiveEntries,
  addPatient
};