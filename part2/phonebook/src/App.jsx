import { useState, useEffect } from "react";

import personService from "./services/persons";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");

  // array di dipendenze vuoto [] => l'effetto gira una sola volta,
  // subito dopo il primo render, non ad ogni render
  useEffect(
    () =>
      personService
        .getAll()
        .then((initialPersons) => setPersons(initialPersons))
        .catch(() => {
          alert("impossibile recuperare i dati dal server");
        }),

    [],
  );

  const addPerson = (event) => {
    event.preventDefault();
    const personObject = {
      name: newName,
      number: newNumber,
    };
    // controllo duplicati lato client, prima di contattare il server:
    // se il nome esiste già, aggiorniamo il numero invece di creare
    // una nuova voce (altrimenti json-server darebbe due persone con
    // lo stesso nome)
    if (persons.some((p) => p.name === newName)) {
      personService
        .updatePerson(persons.find((p) => p.name === newName).id, personObject)
        .then((returnedPerson) => {
          // sostituiamo solo la persona con id corrispondente, lasciando
          // invariate tutte le altre (map, non filter/concat come per create)
          setPersons(
            persons.map((p) =>
              p.id !== returnedPerson.id ? p : returnedPerson,
            ),
          );
          setNewName("");
          setNewNumber("");
        })
        .catch(() => {
          alert(`impossibile aggiornare ${newName}`);
        });
    } else {
      // returnedPerson contiene l'id assegnato dal server: usiamo quello
      // (non personObject) per aggiornare lo state, altrimenti mancherebbe
      personService
        .create(personObject)
        .then((returnedPerson) => {
          setPersons(persons.concat(returnedPerson));
          setNewName("");
          setNewNumber("");
        })
        .catch(() => {
          alert(`impossibile aggiungere ${newName}`);
        });
    }
  };

  // filtro derivato dallo state, ricalcolato ad ogni render:
  // niente state separato per "i risultati filtrati"
  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase()),
  );

  const deletePerson = (person) => {
    // window.confirm è sincrono: blocca l'esecuzione finché l'utente
    // non risponde, a differenza della richiesta axios più sotto
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .deletePerson(person.id)
        .then(() => {
          // rimuoviamo la persona dallo state solo dopo la conferma
          // del server (non ottimisticamente prima della risposta)
          setPersons(persons.filter((p) => p.id !== person.id));
        })
        .catch(() => {
          // capita ad es. se la persona è già stata cancellata da
          // qualcun altro nel frattempo (il DELETE risponde 404)
          alert(`impossibile eliminare ${person.name}`);
        });
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} onChange={(e) => setFilter(e.target.value)} />

      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={(e) => setNewName(e.target.value)}
        newNumber={newNumber}
        onNumberChange={(e) => setNewNumber(e.target.value)}
      />

      <h2>Numbers</h2>
      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  );
};

export default App;
