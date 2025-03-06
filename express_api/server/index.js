const express = require("express");
var mysql = require("mysql2");
var crypto = require("crypto");
const bodyParser = require("body-parser");
const app = express();

var con = mysql.createConnection({
  host: "localhost",
  user: "program",
  password: "password",
  authPlugins: {
    caching_sha2_password: () => () => {},
  },
});

const pool = mysql.createPool({
  host: "localhost", // e.g., 'localhost'
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
        console.error("Error connecting to the database:", err.stack);
        return;
      }
      console.log("Connected to the database as id", connection.threadId);

      // Use the connection
      connection.query(
        "SELECT something FROM sometable",
        (error, results, fields) => {
          // Handle error after the release.
          if (error) throw error;

          // Do something with the results
          console.log(results);

          // Release the connection back to the pool
          connection.release();
        },
      );
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
    const sql = `SELECT id FROM users WHERE username = ? AND password = ?`;
    const params = [username, password];
    const results = await queryDatabase(sql, params);
    if (results.length > 0) return results[0].id;
    else return -1;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err;
  }
}

class Item {
  constructor(id, name, description, ownerId) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ownerId = ownerId;
  }

  // Static method to retrieve an item by ID
  static async getById(id) {
    const sql = "SELECT * FROM items WHERE id = ?";
    const results = await queryDatabase(sql, [id]);
    if (results.length > 0) {
      const { id, name, description, owner_id } = results[0];
      return new Item(id, name, description, owner_id);
    }
    return null;
  }

  // Method to save the item to the database
  async save() {
    if (this.id) {
      // Update existing item
      const sql =
        "UPDATE items SET name = ?, description = ?, owner_id = ? WHERE id = ?";
      await queryDatabase(sql, [
        this.name,
        this.description,
        this.ownerId,
        this.id,
      ]);
    } else {
      // Insert new item
      const sql =
        "INSERT INTO items (name, description, owner_id) VALUES (?, ?, ?)";
      const result = await queryDatabase(sql, [
        this.name,
        this.description,
        this.ownerId,
      ]);
      this.id = result.insertId;
    }
  }
}
let users_db = queryDatabase("SELECT * FROM 'api'.'users'");
if (users_db.length == 0) {
  queryDatabase(
    "INSERT INTO 'api'.'users' (username, sha256_password) VALUES (?, ?)",
    ["root", crypto.createHash("sha256").update("root").digest("hex")],
  );
}

let items = [];
// new Item(null, "Vítkovo Brýle", "Čerstvě Získané", 0),
// new Item(null, "ARCHIso Installation stick", "Nutné pro každého kdo má Arch", 0),
let item_db = queryDatabase("SELECT * FROM 'api'.'items'");
if (item_db.length == 0) {
  items = [
    new Item(null, "Vítkovo Brýle", "Čerstvě Získané", 0),
    new Item(
      null,
      "ARCHIso Installation stick",
      "Nutné pro každého kdo má Arch",
      0,
    ),
  ];
  items[0].save();
  items[1].save();
}
items = item_db;
let token = "asodigkibaoa1616q1f6a1ef3d";
app.use(bodyParser.json());
app.get("/login/:username/:password", async (req, res) => {
  let sha256 = crypto
    .createHash("sha256")
    .update(req.params.password)
    .digest("hex");
  let uid = await getUserID(req.params.username, sha256);
  if (uid != -1) {
    let token = generateToken();
    const res = await queryDatabase(
      `INSERT INTO 'api'.'tokens' (user_id, token, expires) VALUES (?, ?, ?)`,
      [uid, token, new Date(now.getTime() + 10 * 60 * 1000)],
    ); // con.query();
    res.json({ token: token });
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized - Invalid username or password" });
  }
});

app.get("/register/:username/:password"),
  (req, res) => {
    if (
      queryDatabase(
        "SELECT id FROM 'api'.'users' WHERE username = ?",
        req.params.username,
      ).count > 0
    ) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }
    let sha256 = crypto
      .createHash("sha256")
      .update(req.params.password)
      .digest("hex");
    queryDatabase(
      "INSERT INTO 'api'.'users' (username, sha256_password) VALUES (?, ?)",
      [req.params.username, sha256],
    );
    return res.status(200).json({ message: "User created" });
  };

app.get("/items", (req, res) => {
  res.json({ result: 200, items: items });
});

app.get("/item/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.status(200).json(item);
});

app.post("/item/add/:token/:id/:name", (req, res) => {
  let inToken = req.params.token;
  if (inToken != token) {
    res.status(502).json({ message: "Unauthorized - Invalid Token" });
    return;
  }
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) {
    items.push({ id: parseInt(req.params.id), name: req.params.name });
    return res.json(items.find((i) => i.id == parseInt(req.params.id)));
  }

  return res.status(400).json({ message: "Item with this id already exists" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});