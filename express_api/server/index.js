const express = require("express");
var mysql = require("mysql2");
var crypto = require("crypto");
const bodyParser = require("body-parser");
const app = express();

const pool = mysql.createPool({
  host: "db", // e.g., 'localhost'
  user: "program", // e.g., 'root'
  password: "password",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function queryDatabase(sql, params) {
  return new Promise((resolve, reject) => {
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      connection.query(sql, params, (error, results) => {
        connection.release();
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  });
}

function generateToken() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 254) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter++;
  }
  return result;
}
async function getUserID(username, password) {
  try {
    const sql = `SELECT id FROM api.users WHERE username = ? AND sha256_password = ?`;
    const params = [username, password];
    console.log(`Query: ${sql}, params: ${params}`);
    const results = await queryDatabase(sql, params);
    console.log(results);
    if (results.length > 0) return results[0].id;
    else return -1;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err;
  }
}

let users_db = queryDatabase("SELECT * FROM api.users");
if (users_db.length == 0) {
  queryDatabase(
    "INSERT INTO api.users (username, sha256_password) VALUES (?, ?)",
    ["root", crypto.createHash("sha256").update("root").digest("hex")],
  );
}

let token = "asodigkibaoa1616q1f6a1ef3d";
app.use(bodyParser.json());
app.get("/login/:username/:password", async (req, res) => {
  const users = await queryDatabase("SELECT * FROM api.users;");
  let sha256 = crypto
    .createHash("sha256")
    .update(req.params.password)
    .digest("hex");
  let uid = await getUserID(req.params.username, sha256);
  if (uid != -1) {
    let token = generateToken();
    const result = await queryDatabase(
      `INSERT INTO api.tokens (user_id, token, expires) VALUES (?, ?, NOW())`,
      [uid, token],
    ); // con.query();
    console.log(result);
    res.status(200).json({ token: token });
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized - Invalid username or password" });
  }
});

app.get("/register/:username/:password", async (req, res) => {
  let c = await queryDatabase(
    "SELECT * FROM api.users WHERE username = ?",
    req.params.username,
  );
  console.log(c);
  try {
    if (typeof c[0].id != "undefined") {
      res.status(400).json({ message: "Username already exists" });
      return;
    }
  } catch (e) {}
  let sha256 = crypto
    .createHash("sha256")
    .update(req.params.password)
    .digest("hex");
  await queryDatabase(
    "INSERT INTO api.users (username, sha256_password) VALUES (?, ?)",
    [req.params.username, sha256],
  );
  return res.status(200).json({ message: "User created" });
});

app.get("/items", async (req, res) => {
  let items = await queryDatabase("SELECT * FROM api.items;");
  res.json({ result: 200, items: items });
});

app.get("/item/:id", async (req, res) => {
  let item = await queryDatabase(
    `SELECT * FROM api.items WHERE id = ${req.params.id}`,
  );
  if (item.length == 0)
    return res.status(404).json({ message: "Item not found" });
  res.status(200).json(item);
});

app.post("/item/add/:token/:name/:desc", async (req, res) => {
  const sql = `SELECT * FROM api.tokens WHERE token = ?`;
  const results = await queryDatabase(sql, [req.params.token]);
  console.log(results);
  try {
    if (results[0].id == "undefined") {
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "asd" });
  }
  let idb = await queryDatabase(
    `SELECT * FROM api.items WHERE name = '${req.params.name}'`,
  );
  console.log(idb);
  try {
    idb[0].id;
  } catch (e) {let item = await queryDatabase(
      `INSERT INTO api.items (name,descripiton, owner_id) VALUES ("${req.params.name}", "${req.params.desc}", ${results[0].user_id})`,
    );
    return res.json(item.id);
    console.log("No such item")}
  if (true) {
    
  }
  return res
        .status(400)
        .json({ message: "Item with this name already exists" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
