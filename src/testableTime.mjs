const millisPerDay = 24 * 60 * 60 * 1000;

// The function depends directly on the current date (new Date()),
// which makes testing difficult because the result changes depending on the day it's run.
// To make it testable, we can modify the function to accept the current date as a parameter.
// It can now be tested easily.

export function daysUntilChristmas(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const christmasDay = new Date(now.getFullYear(), 12 - 1, 25);
  if (today.getTime() > christmasDay.getTime()) {
    christmasDay.setFullYear(now.getFullYear() + 1);
  }
  const diffMillis = christmasDay.getTime() - today.getTime();
  return Math.floor(diffMillis / millisPerDay);
}
