// Import pg library to interact with postgreSQL
const pg = require("pg");
// Import express module
const express = require("express");
// Initate express server instance
const app = express();
// database client object manages connections to db and executing queries
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgresql://postgres:pass@localhost/acme_icecream_store_db"
);
app.use(express.json());
app.use(require("morgan")("dev"));

// Routes
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors ORDER BY created_at DESC;`;
    const response = await client.query(SQL);
    console.log(response);
    res.send(response.rows);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors WHERE id = $1;`;
    const response = await client.query(SQL, [req.params.id]);
    console.log(response);
    res.send(response.rows);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `INSERT INTO flavors(name, favorite) VALUES($1, $2) RETURNING *`;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.favorite,
    ]);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
});
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
            UPDATE flavors
            SET name=$1, favorite=$2
            WHERE id =$3 RETURNING *
            `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    console.log(error);
  }
});
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
              DELETE from flavors WHERE id=$1;
              `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
  }
});
const init = async () => {
  try {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
    await client.connect();
    console.log("connected to database");

    let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
        );
        `;

    await client.query(SQL);
    console.log("tables created");

    SQL = `
    INSERT INTO flavors(name, favorite) VALUES ('Vanilla', false);
    INSERT INTO flavors(name, favorite) VALUES ('Chocolate', false);
    INSERT INTO flavors(name, favorite) VALUES ('Strawberry', false);
`;
    await client.query(SQL);
    console.log("data seeded");
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

init();
