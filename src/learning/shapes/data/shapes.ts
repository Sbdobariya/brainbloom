export type ShapeId =
  | "circle"
  | "square"
  | "triangle"
  | "rectangle"
  | "star"
  | "heart"
  | "oval"
  | "diamond";

export type ShapeItem = { id: ShapeId; name: string; fact: string };

export const shapes: ShapeItem[] = [
  { id: "circle", name: "Circle", fact: "It is round and has no corners." },
  { id: "square", name: "Square", fact: "It has four equal sides." },
  { id: "triangle", name: "Triangle", fact: "It has three sides." },
  {
    id: "rectangle",
    name: "Rectangle",
    fact: "It has four sides: two long, two short.",
  },
  { id: "star", name: "Star", fact: "It has five pointy tips." },
  { id: "heart", name: "Heart", fact: "We use it to show love." },
  { id: "oval", name: "Oval", fact: "It is like a stretched circle." },
  {
    id: "diamond",
    name: "Diamond",
    fact: "It has four sides and a pointy top.",
  },
];
