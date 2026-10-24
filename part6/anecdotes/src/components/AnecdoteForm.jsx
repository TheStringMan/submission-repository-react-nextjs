import { useAnecdoteActions } from "../store";

const AnectdoteForm = () => {
  const { addAnecdote } = useAnecdoteActions();

  const handleCreate = async (event) => {
    event.preventDefault();
    const content = event.target.elements.anecdote.value;
    await addAnecdote(content);
    event.target.reset();
  };

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={handleCreate}>
        <div>
          <input name="anecdote" />
        </div>
        <button type="submit">create</button>
      </form>
    </>
  );
};

export default AnectdoteForm;
