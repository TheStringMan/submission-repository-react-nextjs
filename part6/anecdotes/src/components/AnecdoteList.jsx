import { useAnecdotes, useAnecdoteActions } from "../store";

const AnectdoteList = () => {
  const anecdotes = useAnecdotes();
  const { vote, deleteAnecdote } = useAnecdoteActions();
  return (
    <>
      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote.id)}>vote</button>
            {anecdote.votes === 0 && (
              <button onClick={() => deleteAnecdote(anecdote.id)}>delete</button>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default AnectdoteList;
