const express = require("express");
const fs = require("fs");
const router = express.Router();
const { verifyToken, validateFields } = require("../middleware/authMiddleware");
const { client } = require("../config/database");
const { check } = require("express-validator");
const { ObjectId } = require("mongodb");

router.get("/getall", [verifyToken], async (req, res) => {
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const posts = database.collection("Posts");
    const messages = database.collection("Message");
    const users = database.collection("Users");
    const data = await posts.find({}).toArray();
    //for de data para buscar sus mensajes
    for (let i = 0; i < data.length; i++) {
      const user = await users
        .find({
          carnet: data[i].author,
        })
        .toArray();
      data[i].author = user[0].nombre;
      const query = {
        postId: data[i]._id.toString(),
      };
      const mensajes = await messages.find(query).toArray();
      data[i].messages = mensajes;
      for (let j = 0; j < data[i].mensajes.length; i++) {
        const user = await users
          .find({
            carnet: data[i].messages[j].author,
          })
          .toArray();
        data[i].messages[j].author = user[0].nombre;
      }
    }
    res.json(data);
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  } finally {
    await cliente.close();
  }
});

router.post(
  "/add",
  [
    verifyToken,
    check("tittle", "tittle es requerido").notEmpty(),
    check("description", "description es requerido").notEmpty(),
    validateFields,
  ],
  async (req, res) => {
    const { tittle, description } = req.body;
    const cliente = client();
    try {
      await cliente.connect();
      const database = cliente.db(process.env.MONGO_DBNAME);
      const posts = database.collection("Posts");
      const data = await posts.insertOne({
        tittle,
        description,
        author: req.user,
      });
      res.json({
        status: "success",
        message: "Post added successfully",
      });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } finally {
      await cliente.close();
    }
  }
);

router.post(
  "/addcomment",
  [
    verifyToken,
    check("postId", "postId es requerido").notEmpty(),
    check("comment", "comment es requerido").notEmpty(),
    validateFields,
  ],
  async (req, res) => {
    const { postId, comment } = req.body;
    const cliente = client();
    try {
      await cliente.connect();
      const database = cliente.db(process.env.MONGO_DBNAME);
      const messages = database.collection("Message");
      const posts = database.collection("Posts");
      const result = posts.find({
        _id: new ObjectId(postId),
      });
      if (result) {
        await messages.insertOne({
          postId,
          comment,
          author: req.user,
        });
        res.json({
          status: "success",
          message: "Message added successfully",
        });
      } else
        res.status(404).json({
          status: "error",
          message: "Post inexistente",
        });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } finally {
      await cliente.close();
    }
  }
);

router.post(
  "/removepost",
  [verifyToken, check("id", "id es requerido").notEmpty(), validateFields],
  async (req, res) => {
    const { id } = req.body;
    const cliente = client();
    try {
      await cliente.connect();
      const database = cliente.db(process.env.MONGO_DBNAME);
      const posts = database.collection("Posts");
      const messages = database.collection("Message");
      let result = await posts.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (result) {
        result = await messages.deleteMany({
          postId: id,
        });
        res.json({
          status: "success",
          message: "Post remove successfully",
        });
      } else
        res.status(404).json({
          status: "error",
          message: "Post inexistente",
        });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } finally {
      await cliente.close();
    }
  }
);

router.post(
  "/removecomment",
  [verifyToken, check("id", "id es requerido").notEmpty(), validateFields],
  async (req, res) => {
    const { id } = req.body;
    const cliente = client();
    try {
      await cliente.connect();
      const database = cliente.db(process.env.MONGO_DBNAME);
      const messages = database.collection("Message");
      let result = await messages.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (result)
        res.json({
          status: "success",
          message: "Message remove successfully",
        });
      else
        res.status(404).json({
          status: "error",
          message: "Message inexistente",
        });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } finally {
      await cliente.close();
    }
  }
);

module.exports = router;
