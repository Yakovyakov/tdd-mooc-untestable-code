//This function cannot be removed, but it can be tested in isolation and decoupled from the business logic.

export function diceRoll() {
  const min = 1;
  const max = 6;
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

// The function depends on the variables die1 and die2, which are random values.
// These values ​​can be generated externally and passed as parameters to this function.
// This way, the function becomes pure and can be easily tested.

export function diceHandValue(die1 = diceRoll(), die2 = diceRoll()) {
  if (die1 === die2) {
    // one pair
    return 100 + die1;
  } else {
    // high die
    return Math.max(die1, die2);
  }
}
