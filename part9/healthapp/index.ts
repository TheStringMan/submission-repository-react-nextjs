import express from 'express';
import { calculateBmi } from './bmiCalculator.ts';
import { calculateExercises } from './exerciseCalculator.ts';

const app = express();
app.use(express.json());

app.get('/hello', (_req, res) => {
    res.send('Hello Full Stack!');
});

app.get('/bmi', (req, res) => {
    const { height, weight } = req.query;
    if (!height || !weight) {
        return res.status(400).json({ error: 'Malformatted parameters' });
    }

    const heightNum = Number(height);
    const weightNum = Number(weight);
    if (isNaN(heightNum) || isNaN(weightNum)) {
        return res.status(400).json({ error: 'Malformatted parameters' });
    }

    const bmi = calculateBmi(heightNum, weightNum);
    return res.json({ height: heightNum, weight: weightNum, bmi });
});

app.post('/exercises', (req, res) => {
    const { daily_exercises, target } = req.body;

    if (!daily_exercises || !target) {
        return res.status(400).json({ error: 'Parameters missing' });
    }

    const dailyExercisesNumbers = daily_exercises.map(Number);
    const targetNumber = Number(target);

    if (dailyExercisesNumbers.some(isNaN) || isNaN(targetNumber)) {
        return res.status(400).json({ error: 'Malformatted parameters' });
    }

    const result = calculateExercises(dailyExercisesNumbers, targetNumber);
    return res.json(result);
});

const PORT = 3003;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});