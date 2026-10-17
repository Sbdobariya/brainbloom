export type NumberItem = {
  n: number;
  word: string;
  emoji: string;
  name: string;
  plural: string;
};

export const numbers: NumberItem[] = [
  { n: 1, word: "one", emoji: "🍎", name: "apple", plural: "apples" },
  { n: 2, word: "two", emoji: "🐶", name: "dog", plural: "dogs" },
  { n: 3, word: "three", emoji: "🐱", name: "cat", plural: "cats" },
  { n: 4, word: "four", emoji: "🚗", name: "car", plural: "cars" },
  { n: 5, word: "five", emoji: "⭐", name: "star", plural: "stars" },
  { n: 6, word: "six", emoji: "🎈", name: "balloon", plural: "balloons" },
  { n: 7, word: "seven", emoji: "🍪", name: "cookie", plural: "cookies" },
  { n: 8, word: "eight", emoji: "🐞", name: "ladybug", plural: "ladybugs" },
  {
    n: 9,
    word: "nine",
    emoji: "🍓",
    name: "strawberry",
    plural: "strawberries",
  },
  { n: 10, word: "ten", emoji: "⚽", name: "ball", plural: "balls" },
];
