import { useState, useEffect } from 'react'
import personService from './services/person'

const Filter = ({filter, onFilterChanged}) => {
  return (
    <div>
      filter shown with a: <input value={filter} onChange={(event) => onFilterChanged(event.target.value)}/>
    </div>
  )
}

const People = ({people, onPeopleChange}) => {
  const deletePerson = id => {
      personService
        .deletePerson(id)
        .then(_ => {
          onPeopleChange(people.filter(n => n.id !== id))
        })
        .catch(error => {
          alert(
            `the person '${person.name}' was already deleted from server`
          )
        })
    }

  return (
    <div>
      {people.map(person => <Person key={person.id} person={person} OnClickDeletePerson={deletePerson}/>)}
    </div>
  )
}

const Person = ({person, OnClickDeletePerson}) => {
  return (
    <div>
      <div key={person.id}>{person.name} {person.number} <button onClick={() => OnClickDeletePerson(person.id)}>delete</button></div>
    </div>
  )
}

const PersonForm = ({people, onPeopleChange, onMessageChanged}) => {
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')

  const addName = (event) => {
    event.preventDefault()

    const person = people.find((x) => x.name == newName)
    if(person != undefined && person.id != 0 && confirm(newName + ' is already added to phonebook. Replace the old number with the new one?'))
    {
      const changedPerson = { ...person, number: newNumber }

      personService
        .update(person.id, changedPerson)
        .then(response => {
          onPeopleChange(people.map(note => note.id === changedPerson.id ? response : note))
          setNewName('')
          setNewNumber('')

          onMessageChanged(
          `Added '${response.name}' `
          )
          setTimeout(() => {
            onMessageChanged(null)
          }, 5000)
        })
    }else{
      const personObject = { name: newName, number: newNumber }

      personService
        .create(personObject)
        .then(response => {
          onPeopleChange(people.concat(response))
          setNewName('')
          setNewNumber('')

          onMessageChanged(
          `Added '${response.name}' `
          )
          setTimeout(() => {
            onMessageChanged(null)
          }, 5000)
        })
    }
  }

  return (
    <div>
      <form onSubmit={addName}>
        <div>
          name: <input value={newName} onChange={(event) => setNewName(event.target.value)}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={(event) => setNewNumber(event.target.value)}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  )
}

const Notification = ({ message }) => {
  const notificationStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBbottom: 10
  }

  if (message === null) {
    return null
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const App = () => {
  const [people, setPersons] = useState([])
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const peopleToShow = filter === ''
      ? people
      : people.filter(person => person.name.toLowerCase().includes(filter.toLowerCase())
    )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter filter={filter} onFilterChanged={setFilter} />
      <h2>Add a new</h2>
      <PersonForm people={people} onPeopleChange={setPersons} onMessageChanged={setMessage}/>
      <h2>Numbers</h2>
      <People people={peopleToShow} onPeopleChange={setPersons} />
    </div>
  )
}

export default App