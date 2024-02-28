export function getRandomInteger() {
  // Generate a random number between 0 and 1
  const random = Math.random();

  // Scale the random number to fit within the desired range
  const scaled = Math.floor(random * (89 - 70 + 1)) + 70;

  return scaled;
}
