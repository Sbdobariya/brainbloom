declare module "node:assert" {
  interface Assert {
    deepStrictEqual(actual: unknown, expected: unknown): void;
    notStrictEqual(actual: unknown, expected: unknown): void;
    strictEqual(actual: unknown, expected: unknown): void;
  }

  const assert: Assert;
  export default assert;
}
