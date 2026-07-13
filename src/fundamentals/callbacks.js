/**
 * Simulates an asynchronous operation (e.g. a slow I/O call) using setTimeout.
 * Follows the Node.js "error-first callback" convention: callback(error, result).
 *
 * @param {number[]} numbers - Numbers to sum asynchronously.
 * @param {(error: Error | null, result?: number) => void} callback
 */
function sumNumbersAsync(numbers, callback) {
  setTimeout(() => {
    if (!Array.isArray(numbers)) {
      callback(new Error('"numbers" must be an array'));
      return;
    }

    const total = numbers.reduce((acc, n) => acc + n, 0);
    callback(null, total);
  }, 1000);
}

// --- Usage example ---

// success case
sumNumbersAsync([1, 2, 3, 4], (err, result) => {
  if (err) {
    console.error("Operation failed:", err.message);
    return;
  }
  console.log("Sum result:", result);
});

// error case
sumNumbersAsync("not-an-array", (err, result) => {
  if (err) {
    console.error("Operation failed:", err.message);
    return;
  }
  console.log("Sum result:", result);
});
