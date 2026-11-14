interface ExerciseResult {
    periodLength: number;
    trainingDays: number;
    success: boolean;
    rating: number;
    ratingDescription: string;
    target: number;
    average: number;
}

export const calculateExercises = (dailyExercisesHours: number[], target: number): ExerciseResult => {
    let rating: number;
    let ratingDescription: string;

    const averegeHours = dailyExercisesHours.reduce((sum, day) => sum + day, 0) / dailyExercisesHours.length;
    if (averegeHours < target * 0.75) {
        rating = 1;
        ratingDescription = 'You need to work harder';
    } else if (averegeHours < target) {
        rating = 2;
        ratingDescription = 'not too bad but could be better';
    }
    else if (averegeHours === target) {
        rating = 2;
        ratingDescription = 'Good job, you met your target';
    }
    else {
        rating = 3;
        ratingDescription = 'Excellent, you exceeded your target';
    }

    const result = {
        periodLength: dailyExercisesHours.length,
        trainingDays: dailyExercisesHours.filter(day => day > 0).length,
        success: dailyExercisesHours.reduce((sum, day) => sum + day, 0) / dailyExercisesHours.length >= target,
        rating: rating,
        ratingDescription: ratingDescription,
        target: target,
        average: dailyExercisesHours.reduce((sum, day) => sum + day, 0) / dailyExercisesHours.length
    };
    return result;
};


const parseExerciseArguments = (args: string[]): number[] => {
    const target = Number(args[2]);
    const dailyExercises = args.slice(3).map(Number);

    if (isNaN(target) || dailyExercises.some(isNaN)) {
        throw new Error('Provided values were not numbers!');
    }
    return [target, ...dailyExercises];
};

try {
    const [target, ...dailyExercises] = parseExerciseArguments(process.argv);
    console.log(calculateExercises(dailyExercises, target));
} catch (error: unknown) {
    let errorMessage = 'Something bad happened.';
    if (error instanceof Error) {
        errorMessage += ' Error: ' + error.message;
    }
    console.log(errorMessage);
}