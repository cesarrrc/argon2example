require("dotenv").config();
const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken")

const { connection } = require("./sql/connection");
const { checkJwt } = require('./utils/checkJwt')

const app = express();
const jwtSecret = process.env.JWT
const port = process.env.PORT || 3330;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("hello world");
});

app.get("/users", checkJwt, (req, res) => {
  console.log("in GET /users route");
  let sql = `SELECT * FROM users`;
  connection.query(sql, (err, rows) => {
    res.json(rows);
  });
});

app.post("/users", async (req, res) => {
  console.log("in POST /users route");
  let { user_name, user_password, user_email, first_name, last_name } =
    req.body;
  let sql = `
    INSERT INTO users (user_name, user_password, user_email, first_name, last_name) 
    VALUES(?,?,?,?,?)
    `;

  let hash = await argon2.hash(user_password);
  let body = [user_name, hash, user_email, first_name, last_name];
  connection.query(sql, body, (err, rows) => {
    if (err) {
      res.status(500).send(err);
      console.log(err);
    }
    res.send(rows);
  });
});

app.post("/login", async (req, res) => {
  console.log("inside the POST /login route");
  let { user_name, user_password } = req.body;
  let sql = `SELECT * FROM users WHERE user_name = ?`;
  connection.query(sql, [user_name], (err, rows) => {
    if (err) {
      res.status(500).send(err);
      console.log(err);
    }
    const hash = rows[0].user_password;
    console.log(rows[0].user_password);
    console.log(hash);
    if (!argon2.verify(hash, user_password)) {
      res.status(401).send('your password does not match')
    } else {
      const unsignedToken = {
        user_name: rows[0].user_name,
        user_id: rows[0].user_id
      }
      const token = jwt.sign(unsignedToken, jwtSecret)
      res.json({token})
    }
  });
});

app.listen(port, () => {
  console.log("listnenig on Port:", port);
});