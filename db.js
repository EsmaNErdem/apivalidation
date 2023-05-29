/** Database config for database. */


const { Client } = require("pg");
const {dbName} = require("./config");

let db = new Client({
  host: "/var/run/postgresql/",
  database: dbName,
});

const connectToDatabase = async () => {
  await db.connect();
}

connectToDatabase()

module.exports = db;
