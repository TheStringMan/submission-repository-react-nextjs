import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("./services/anecdotes", () => ({
  default: {
    getAll: vi.fn(),
    createNew: vi.fn(),
    update: vi.fn(),
  },
}));

import anecdotesService from "./services/anecdotes";
import useAnecdoteStore, { useAnecdotes, useAnecdoteActions } from "./store";

beforeEach(() => {
  useAnecdoteStore.setState({ anecdotes: [], filter: "" });
  vi.clearAllMocks();
});

describe("useAnecdoteActions", () => {
  it("initialize loads anecdotes from service", async () => {
    const mockAnecdotes = [{ id: 1, content: "Test", votes: 0 }];
    anecdotesService.getAll.mockResolvedValue(mockAnecdotes);

    const { result } = renderHook(() => useAnecdoteActions());

    await act(async () => {
      await result.current.initialize();
    });

    const { result: anecdotesResult } = renderHook(() => useAnecdotes());
    expect(anecdotesResult.current).toEqual(mockAnecdotes);
  });

  it("add appends a new anecdote", async () => {
    const newAnecdote = { id: 2, content: "New anecdote", votes: 0 };
    anecdotesService.createNew.mockResolvedValue(newAnecdote);

    const { result } = renderHook(() => useAnecdoteActions());

    await act(async () => {
      await result.current.addAnecdote("New anecdote");
    });

    const { result: anecdotesResult } = renderHook(() => useAnecdotes());
    expect(anecdotesResult.current).toContainEqual(newAnecdote);
  });

  it("increase vote count", async () => {
    const anecdote = { id: 1, content: "Test", votes: 0 };
    useAnecdoteStore.setState({ anecdotes: [anecdote] });
    anecdotesService.update.mockResolvedValue({ ...anecdote, votes: 1 });

    const { result } = renderHook(() => useAnecdoteActions());

    await act(async () => {
      await result.current.vote(1);
    });

    const { result: anecdotesResult } = renderHook(() => useAnecdotes());
    expect(anecdotesResult.current[0].votes).toBe(1);
  });

  it("anecdotes are returned sorted by votes", () => {
    const unsorted = [
      { id: 1, content: "A", votes: 1 },
      { id: 2, content: "B", votes: 5 },
      { id: 3, content: "C", votes: 3 },
    ];
    useAnecdoteStore.setState({ anecdotes: unsorted });

    const { result } = renderHook(() => useAnecdotes());

    expect(result.current.map((a) => a.votes)).toEqual([5, 3, 1]);
  });

  it("Receive anecdotes filtered by content", () => {
    const anecdotes = [
      { id: 1, content: "React is great", votes: 1 },
      { id: 2, content: "Vue is also great", votes: 5 },
      { id: 3, content: "Angular is okay", votes: 3 },
    ];
    useAnecdoteStore.setState({ anecdotes, filter: "great" });

    const { result } = renderHook(() => useAnecdotes());

    expect(result.current).toEqual([
      { id: 2, content: "Vue is also great", votes: 5 },
      { id: 1, content: "React is great", votes: 1 },
    ]);
  });
});
