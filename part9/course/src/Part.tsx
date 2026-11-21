import type { CoursePart } from "./types.ts";

interface PartProps {
  coursePart: CoursePart;
}

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`,
  );
};

const Part = (props: PartProps) => {
  const part = props.coursePart;

  switch (part.kind) {
    case "basic":
      return (
        <div>
          <h3>{part.name}</h3>
          <p>Exercise Count: {part.exerciseCount}</p>
          <p>Description: {part.description}</p>
        </div>
      );
    case "group":
      return (
        <div>
          <h3>{part.name}</h3>
          <p>Exercise Count: {part.exerciseCount}</p>
          <p>Group Project Count: {part.groupProjectCount}</p>
        </div>
      );
    case "background":
      return (
        <div>
          <h3>{part.name}</h3>
          <p>Exercise Count: {part.exerciseCount}</p>
          <p>Description: {part.description}</p>
          <p>Background Material: {part.backgroundMaterial}</p>
        </div>
      );

    case "requirements":
      return (
        <div>
          <h3>{part.name}</h3>
          <p>Exercise Count: {part.exerciseCount}</p>
          <p>Description: {part.description}</p>
          <p>Requirements: {part.requirements.join(", ")}</p>
        </div>
      );
    default:
      return assertNever(part);
  }
};

export default Part;
