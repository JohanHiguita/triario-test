const { Readable, Transform } = require("stream");

/**
 * Transform stream that uppercases every chunk it receives.
 */
const toUpperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});

// --- Usage example ---
// Readable.from(iterable) turns an array of strings into a Readable stream,
// emitting one chunk per array element.
Readable.from(["hello ", "streams ", "in ", "node.js\n"])
  .pipe(toUpperCaseTransform)
  .pipe(process.stdout);
