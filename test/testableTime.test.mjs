import { describe, test } from "vitest";
import { expect } from "chai";
import { daysUntilChristmas } from "../src/testableTime.mjs";

describe("days until Christmas", () => {
  test("the Christmas day", () => {
    // TODO: write proper tests
    expect(daysUntilChristmas(new Date("2025-12-25T00:00:00"))).to.equal(0);
    expect(daysUntilChristmas(new Date("2025-12-25T12:00:00"))).to.equal(0);
    expect(daysUntilChristmas(new Date("2025-12-25T23:59:59"))).to.equal(0);
  });

  test("day before Christmas day", () => {
    expect(daysUntilChristmas(new Date("2025-12-24T00:00:00"))).to.equal(1);
    expect(daysUntilChristmas(new Date("2025-12-24T12:00:00"))).to.equal(1);
    expect(daysUntilChristmas(new Date("2025-12-24T23:59:59"))).to.equal(1);
  });

  test("day after Christmas day", () => {
    expect(daysUntilChristmas(new Date("2025-12-26T00:00:00"))).to.equal(364);
    expect(daysUntilChristmas(new Date("2025-12-26T12:00:00"))).to.equal(364);
    expect(daysUntilChristmas(new Date("2025-12-26T23:59:59"))).to.equal(364);
  });

  test("day after Christmas day (2024 is a leap year)", () => {
    expect(daysUntilChristmas(new Date("2023-12-26T00:00:00"))).to.equal(365);
    expect(daysUntilChristmas(new Date("2023-12-26T12:00:00"))).to.equal(365);
    expect(daysUntilChristmas(new Date("2023-12-26T23:59:59"))).to.equal(365);
  });

});
