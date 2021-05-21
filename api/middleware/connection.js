const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "rukkiecodes",
    password: "rukkiecodes",
    database: "dabi",
  },
});

module.exports = db;
