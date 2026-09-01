import axios from "axios";
// json-server (npm run server) serve i dati su questa porta/risorsa
const baseUrl = "http://localhost:3001/api/persons";

const getAll = () => {
  const request = axios.get(baseUrl);
  // axios.get restituisce una promise: chi chiama getAll() riceve già
  // response.data (l'array di persone), non l'intero oggetto response
  return request.then((response) => response.data);
};

const create = (newObject) => {
  const request = axios.post(baseUrl, newObject);
  // il server assegna l'id alla nuova persona: lo restituiamo insieme
  // al resto dei dati, così App.jsx può usarlo (es. per la key nella lista)
  return request.then((response) => response.data);
};

const deletePerson = (id) => {
  // json-server risponde con status 200 e body vuoto su DELETE riuscito,
  // quindi response.data qui non serve a chi chiama la funzione
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

const updatePerson = (id, newObject) => {
  // PUT sostituisce l'intera risorsa con id sul server: newObject deve
  // contenere già tutti i campi (name e number), non solo quello cambiato
  const request = axios.put(`${baseUrl}/${id}`, newObject);
  return request.then((response) => response.data);
};

export default { getAll, create, deletePerson, updatePerson };
