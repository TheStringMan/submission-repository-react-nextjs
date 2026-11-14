
export const calculateBmi = (height: number, mass: number): string => {
    let heightInMeters: number = height / 100; // Convert height from cm to meters
    let bmi: number = mass / (heightInMeters * heightInMeters);
    switch (true) {
        case bmi < 18.5:
            return 'Underweight';
        case bmi < 25:
            return 'Normal range';
        case bmi < 30:
            return 'Overweight';
        default:
            return 'Obese';
    }
}

interface Values {
    value1: number;
    value2: number;
}

const parseBmiArguments = (args: string[]): Values => {
    if (args.length < 4) throw new Error('Not enough arguments');
    if (args.length > 4) throw new Error('Too many arguments');

    if (!isNaN(Number(args[2])) && !isNaN(Number(args[3]))) {
        return {
            value1: Number(args[2]),
            value2: Number(args[3])
        }
    } else {
        throw new Error('Provided values were not numbers!');
    }
}

if (process.argv[1] === import.meta.filename) {
    try {
        const { value1, value2 } = parseBmiArguments(process.argv);
        console.log(calculateBmi(value1, value2));
    } catch (error: unknown) {
        let errorMessage = 'Something bad happened.'
        if (error instanceof Error) {
            errorMessage += ' Error: ' + error.message;
        }
        console.log(errorMessage);
    }
}
