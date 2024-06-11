const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { verifyLogin, createToken } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs/dist/bcrypt");
const { client } = require("../config/database");

router.post("/", verifyLogin, async (req, res) => {
  const { username } = req.body;
  let token = await createToken({
    name: username,
  });

  res.json({ token });
});

router.post("/add", async (req, res) => {
  const { users } = req.body;
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const Users = database.collection("Users");
    console.log(users.length);
    for (let i = 0; i < users.length; i++) {
      const salt = bcrypt.genSaltSync(10);
      await Users.insertOne({
        carnet: users[i].carnet,
        nombre: users[i].nombre,
        correo: users[i].correo,
        password: bcrypt.hashSync(users[i].password, salt),
      });
    }
    res.json({
      status: "success",
      message: "Users added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid Credential" });
  } finally {
    await cliente.close();
  }
});

module.exports = router;
