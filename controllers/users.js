const {connection} = require('../sql/connection')
const  argon2  = require("argon2");

async function createUser(req, res){
    console.log("in POST /users route");
    let hash;
    let { user_name, user_password, user_email, first_name, last_name } =
      req.body;
    let sql = `
      INSERT INTO users (user_name, user_password, user_email, first_name, last_name) 
      VALUES(?,?,?,?,?)
      `;
    try {
      hash = await argon2.hash(user_password);
      let body = [user_name, hash, user_email, first_name, last_name];
      connection.query(sql, body, (err, rows) => {
        if (err) {
          res.status(500).send(err);
          console.log(err);
        }
        res.send(rows);
      });
    } catch (err) {
      console.log(err);
    }
}

module.exports = {createUser}