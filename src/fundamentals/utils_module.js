/**
 * Sums an array of numbers. Exported using CommonJS (module.exports).
 *
 * @param {number[]} numbers
 * @returns {number}
 */
function sumArray(numbers) {
  if (!Array.isArray(numbers)) {
    throw new Error('"numbers" must be an array');
  }

  return numbers.reduce((acc, n) => acc + n, 0);
}

module.exports = { sumArray };
