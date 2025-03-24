import { describe, test, beforeEach, afterEach, vi } from "vitest";
import { expect } from "chai";
import { daysUntilChristmas } from "../src/untestable1.mjs";

describe("Untestable 1: days until Christmas with vi.useFakeTimers", () => {
  beforeEach(() => {
    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("the Christmas day", () => {
    const date = new Date(2025, 11, 25);
    vi.setSystemTime(date);

    expect(daysUntilChristmas()).toBe(0);
  });

  test("day before Christmas day", () => {
    const date = new Date(2025, 11, 24);
    vi.setSystemTime(date);

    expect(daysUntilChristmas()).toBe(1);
  });

  test("day after Christmas day", () => {
    const date = new Date(2025, 11, 26);
    vi.setSystemTime(date);

    expect(daysUntilChristmas()).toBe(364);
  });

  test("day after Christmas day (2024 is a leap year)", () => {
    const date = new Date(2023, 11, 26);
    vi.setSystemTime(date);

    expect(daysUntilChristmas()).toBe(365);
  });
});
