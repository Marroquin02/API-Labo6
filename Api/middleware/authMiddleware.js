const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { client } = require("../config/database");
const { validationResult } = require("express-validator");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || !token.split(" ")[1]) {
    return res.status(403).json({ message: "Token not provided" });
  }
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const tokens = database.collection("Tokens");
    const query = {
      hash: token.split(" ")[1],
    };

    const _token = await tokens.find(query).toArray();
    if (!_token || !_token.length) {
      return res.status(403).json({ message: "Token not provided" });
    }
    jwt.verify(_token[0].token, process.env.JWT, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = decoded.name;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "Token not provided" });
  } finally {
    await cliente.close();
  }
};

const verifyLogin = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(422).send({ message: "Missing data!" });
  }
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const users = database.collection("Users");

    const query = {
      carnet: username,
    };
    const user = await users.find(query).toArray();
    if (!user.length) {
      const salt = bcrypt.genSaltSync(10);
      await users.insertOne({
        username,
        password: bcrypt.hashSync(password, salt),
      });
      return res.status(401).json({ message: "Invalid Credential." });
    }
    // const isValidPassword = bcrypt.compareSync(password, user[0].password);
    // if (!isValidPassword) {
    //   return res.status(401).json({ message: "Invalid Credential." });
    // }
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid Credential" });
  } finally {
    await cliente.close();
  }
};

const createToken = async (user) => {
  let token = jwt.sign(user, process.env.JWT, { expiresIn: "2h" });
  const salt = bcrypt.genSaltSync(2);
  const hashedToken = bcrypt.hashSync(token, salt);
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const tokens = database.collection("Tokens");
    await tokens.insertOne({
      token,
      hash: hashedToken,
    });
  } catch (error) {
    console.log(error);
  } finally {
    await cliente.close();
    return hashedToken;
  }
};

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("validate-fields: ", errors);
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

module.exports = {
  verifyToken,
  createToken,
  verifyLogin,
  validateFields,
};
