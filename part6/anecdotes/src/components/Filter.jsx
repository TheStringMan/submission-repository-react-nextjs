import { useFilter, useAnecdoteActions } from "../store";

const Filter = () => {
  const filter = useFilter();
  const { setFilter } = useAnecdoteActions();

  const handleChange = (event) => {
    setFilter(event.target.value);
  }
  const style = {
    marginBottom: 10
  }

  return (
    <div style={style}>
      filter <input onChange={handleChange} value={filter} data-testid="filter" />
    </div>
  )
}

export default Filter