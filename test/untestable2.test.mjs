import { describe, test, vi } from "vitest";
import { expect } from "chai";
import { diceHandValue } from "../src/untestable2.mjs";
import { random } from "lodash";

describe("Untestable 2: a dice game", () => {
  // If we want to test the x function, we could mock the random function
  // to control the values ​​returned by the diceRoll function.
  // To mock the function, we do it with vi.spyOn

  test("one pair", () => {
    // random function should return 0 then diceRoll function return 1
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(diceHandValue()).to.equal(101);
    // random function should return 0.48 then diceRoll function return 3
    vi.spyOn(Math, "random").mockReturnValue(0.48);
    expect(diceHandValue()).to.equal(103);
    // random function should return 0.9 then diceRoll function return 6
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    expect(diceHandValue()).to.equal(106);
    vi.restoreAllMocks();
  });

  test("high die", () => {
    // random function should return the first time 0.5 then diceRoll function return 4
    // random function should return the second time 0.2 then diceRoll function return 2
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.2);

    expect(diceHandValue()).to.equal(4);
    vi.restoreAllMocks();
  });

  // To test the diceRoll function we do the same tests that we did in testableRandom,
  // you just have to export said function in the untestable2.mjs file
});
