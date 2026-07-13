/**
 * Same operation as callbacks.js, refactored to return a Promise instead of
 * receiving a callback. setTimeout still simulates the asynchronous delay.
 *
 * @param {number[]} numbers - Numbers to sum asynchronously.
 * @returns {Promise<number>}
 */
function sumNumbersAsync(numbers) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Array.isArray(numbers)) {
        reject(new Error('"numbers" must be an array'));
        return;
      }

      const total = numbers.reduce((acc, n) => acc + n, 0);
      resolve(total);
    }, 1000);
  });
}

// --- Usage example ---

async function main() {
  // success case
  try {
    const total = await sumNumbersAsync([1, 2, 3, 4]);
    console.log("Sum result:", total);
  } catch (err) {
    console.error("Operation failed:", err.message);
  }

  // error case
  try {
    const total = await sumNumbersAsync("not-an-array");
    console.log("Sum result:", total);
  } catch (err) {
    console.error("Operation failed:", err.message);
  }
}

main();
 