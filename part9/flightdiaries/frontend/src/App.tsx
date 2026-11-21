import { useEffect, useState } from "react";
import { getAllDiaries, createDiary } from "./services/diary";
import type { Diary, NewDiary, Visibility, Weather } from "./types";
import axios from "axios";

function App() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [newDiary, setNewDiary] = useState<NewDiary>({
    date: "",
    weather: "sunny",
    visibility: "great",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllDiaries().then((data) => setDiaries(data));
  }, []);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      await createDiary(newDiary)
        .then((createdDiary) => {
          setDiaries([...diaries, createdDiary]);
          setNewDiary({
            date: "",
            weather: "sunny",
            visibility: "great",
          });
        });
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        const issues = error.response?.data?.error;
        setError(
          Array.isArray(issues) ? issues[0]?.message : "An error occurred",
        );
        console.log(error.status);
        console.error(error.response);
        console.error("Error creating diary:", error.message);
      }
    }
  };

  return (
    <div>
      <h1>Ilari's flight diaries</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {diaries.map((diary) => (
        <div key={diary.id}>
          <p>{diary.date}</p>
          <p>Weather: {diary.weather}</p>
          <p>Visibility: {diary.visibility}</p>
        </div>
      ))}

      <h2>Add new diary</h2>
      <form onSubmit={handleSubmit}>
        <div>
          Date:{" "}
          <input
            type="date"
            value={newDiary.date}
            onChange={(e) => setNewDiary({ ...newDiary, date: e.target.value })}
          />
        </div>
        <div>
          Weather:{" "}
          <select
            value={newDiary.weather}
            onChange={(e) =>
              setNewDiary({ ...newDiary, weather: e.target.value as Weather })
            }
          >
            <option value="sunny">Sunny</option>
            <option value="rainy">Rainy</option>
            <option value="cloudy">Cloudy</option>
            <option value="stormy">Stormy</option>
            <option value="windy">Windy</option>
          </select>
        </div>
        <div>
          Visibility:{" "}
          <select
            value={newDiary.visibility}
            onChange={(e) =>
              setNewDiary({
                ...newDiary,
                visibility: e.target.value as Visibility,
              })
            }
          >
            <option value="great">Great</option>
            <option value="good">Good</option>
            <option value="ok">Ok</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <button type="submit">Add diary</button>
      </form>
    </div>
  );
}

export default App;
