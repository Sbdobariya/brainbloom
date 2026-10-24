export type Gesture = "tap" | "drag";

export type HowToStep = {
  demo: string; // emoji shown in the demo stage
  target?: string; // optional second emoji (drag destination)
  gesture: Gesture;
  instruction: string; // short, spoken aloud
};

export const HOW_TO_PLAY: Record<
  string,
  { title: string; steps: HowToStep[] }
> = {
  ticTacToe: {
    title: "Tic Tac Toe",
    steps: [
      {
        demo: "❌",
        gesture: "tap",
        instruction: "Tap a square to put your X.",
      },
      {
        demo: "⭕",
        gesture: "tap",
        instruction: "The computer plays O. Get three in a row to win!",
      },
    ],
  },
  wordBuilder: {
    title: "Word Builder",
    steps: [
      {
        demo: "🅰️",
        target: "⬜",
        gesture: "tap",
        instruction: "Tap the letters in the right order to spell the word.",
      },
    ],
  },
  slidingPuzzle: {
    title: "Sliding Puzzle",
    steps: [
      {
        demo: "🧩",
        gesture: "tap",
        instruction:
          "Tap a piece next to the empty space to slide it. Put the pieces in order.",
      },
    ],
  },
  waterSort: {
    title: "Water Sort",
    steps: [
      {
        demo: "🧪",
        target: "🧪",
        gesture: "tap",
        instruction:
          "Tap a tube, then tap another tube to pour. Make each tube one color.",
      },
    ],
  },
  freeFlow: {
    title: "Free Flow",
    steps: [
      {
        demo: "🔴",
        target: "🔴",
        gesture: "drag",
        instruction: "Drag from one dot to the matching dot to draw a line.",
      },
    ],
  },
  quiz: {
    title: "Quiz",
    steps: [
      {
        demo: "❓",
        gesture: "tap",
        instruction: "Read the question and tap the right answer.",
      },
    ],
  },
  alphabet: {
    title: "ABC",
    steps: [
      {
        demo: "🔤",
        gesture: "tap",
        instruction:
          "Tap the arrows to see the next letter. Tap the speaker to hear it.",
      },
    ],
  },
  findLetter: {
    title: "Find the Letter",
    steps: [
      {
        demo: "🔍",
        gesture: "tap",
        instruction: "Listen, then tap the letter you hear.",
      },
    ],
  },
  numbers: {
    title: "123",
    steps: [
      {
        demo: "🍎",
        gesture: "tap",
        instruction:
          "Tap each thing to count it. Tap the arrows for the next number.",
      },
    ],
  },
  howMany: {
    title: "How Many?",
    steps: [
      {
        demo: "🧮",
        gesture: "tap",
        instruction: "Count the things, then tap the right number.",
      },
    ],
  },
  colors: {
    title: "Colors",
    steps: [
      {
        demo: "🎨",
        gesture: "tap",
        instruction:
          "Tap the arrows to see each color. Tap the speaker to hear its name.",
      },
    ],
  },
  findColor: {
    title: "Name the Color",
    steps: [
      {
        demo: "🖍️",
        gesture: "tap",
        instruction: "Listen, then tap the box with the right color.",
      },
    ],
  },
  shapes: {
    title: "Shapes",
    steps: [
      {
        demo: "🔷",
        gesture: "tap",
        instruction:
          "Tap the arrows to see each shape. Tap the speaker to hear its name.",
      },
    ],
  },
  findShape: {
    title: "Find the Shape",
    steps: [
      {
        demo: "🔺",
        gesture: "tap",
        instruction: "Listen, then tap the shape you hear.",
      },
    ],
  },
};
