const Persons = ({ persons, onDelete }) => (
  <ul>
    {persons.map((person) => (
      <li key={person.name}>
        {person.name}: {person.number}
        <button onClick={() => onDelete(person)}>delete</button>
      </li>
    ))}
  </ul>
);

export default Persons;
