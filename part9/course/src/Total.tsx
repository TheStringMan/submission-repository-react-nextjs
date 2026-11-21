interface TotalProps {
  exerciseCount: number;
}

const Total = (props: TotalProps) => {
   return <p>Number of exercises {props.exerciseCount}</p>;
};

export default Total;