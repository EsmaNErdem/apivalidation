/** Common config for bookstore. */

const dbName = (process.env.NODE_ENV === "test")
  ? "books_test"
  : "books";

module.exports = { dbName };