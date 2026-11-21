import axios from "axios";
import type { Diary, NewDiary } from "../types.ts";

const baseUrl = "http://localhost:3000/api/diaries";

export const getAllDiaries = async () => {
    const response = await axios.get<Diary[]>(baseUrl);
    return response.data;
};

export const createDiary = async (newDiary: NewDiary) => {
    const response = await axios.post<Diary>(baseUrl, newDiary);
    return response.data;
}