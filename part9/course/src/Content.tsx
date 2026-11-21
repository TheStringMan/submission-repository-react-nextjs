import type { CoursePart } from "./types.ts";
import Part from "./Part.tsx";

interface ContentProps {
  coursePart: CoursePart[];
}

const Content = (props: ContentProps) => {
  return (
    <>
      {props.coursePart.map((part) => (
        <Part key={part.name} coursePart={part} />
      ))}
    </>
  );
};

export default Content;

