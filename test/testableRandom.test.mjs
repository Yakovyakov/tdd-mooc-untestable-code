import { describe, test } from "vitest";
import { expect } from "chai";
import { diceHandValue, diceRoll } from "../src/testableRandom.mjs";

describe("testableRandom: a dice game", () => {
  [
    { value: 1, expectedValue: 101 },
    { value: 2, expectedValue: 102 },
    { value: 3, expectedValue: 103 },
    { value: 4, expectedValue: 104 },
    { value: 5, expectedValue: 105 },
    { value: 6, expectedValue: 106 },
  ].forEach(({ value, expectedValue }) => {
    test("one pair", () => {
      expect(diceHandValue(value, value)).to.equal(expectedValue);
    });
  });

  [
    { die1: 1, die2: 2, expectedValue: 2 },
    { die1: 1, die2: 3, expectedValue: 3 },
    { die1: 1, die2: 4, expectedValue: 4 },
    { die1: 1, die2: 5, expectedValue: 5 },
    { die1: 1, die2: 6, expectedValue: 6 },
    { die1: 2, die2: 3, expectedValue: 3 },
    { die1: 2, die2: 4, expectedValue: 4 },
    { die1: 2, die2: 5, expectedValue: 5 },
    { die1: 2, die2: 6, expectedValue: 6 },
    { die1: 3, die2: 4, expectedValue: 4 },
    { die1: 3, die2: 5, expectedValue: 5 },
    { die1: 3, die2: 6, expectedValue: 6 },
    { die1: 4, die2: 5, expectedValue: 5 },
    { die1: 4, die2: 6, expectedValue: 6 },
    { die1: 5, die2: 6, expectedValue: 6 },
  ].forEach(({ die1, die2, expectedValue }) => {
    test("die high", () => {
      expect(diceHandValue(die1, die2)).to.equal(expectedValue);
      expect(diceHandValue(die2, die1)).to.equal(expectedValue);
    });
  });

  // In randomess function we can test known invariants.
  // In this case, all the values are known to be between 1 and 6, so we can test that.
  // if we throw the dice repeatedly, it should eventually return all the 6 possible values
  // and the distribution of numbers should be uniform approximately 1/6

  describe("Test diceRoll function", () => {
    test("should return a number between 1 and 6", () => {
      for (let i = 0; i < 1000; i++) {
        const result = diceRoll();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });

    test("if we throw the dice repeatedly, it should eventually return all the 6 possible values", () => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      for (let i = 0; i < 1000; i++) {
        const result = diceRoll();
        counts[result]++;
      }

      for (let number = 1; number <= 6; number++) {
        expect(counts[number]).toBeGreaterThan(0);
      }
    });

    const testCases = [];
    const interval = { min: 1, max: 5000 };
    for (let k = interval.min; k <= interval.max; k++) {
      testCases.push(k);
    }

    test.each(testCases)(
      "the probability of each outcome should satisfy (1/5<= 1/6 >= 1/7), ensuring a uniform distribution (%i)",
      () => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        for (let i = 0; i < 10000; i++) {
          const result = diceRoll();
          counts[result]++;
        }

        for (let number = 1; number <= 6; number++) {
          expect(counts[number]).toBeGreaterThanOrEqual(1428);
          expect(counts[number]).toBeLessThanOrEqual(2000);
        }
      },
    );
  });
});
