const express = require("express");
const fs = require("fs");
const router = express.Router();
const { verifyToken, validateFields } = require("../middleware/authMiddleware");
const { client } = require("../config/database");
const { check } = require("express-validator");
const { ObjectId } = require("mongodb");

router.post("/getall", [verifyToken], async (req, res) => {
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const posts = database.collection("Posts");
    const messages = database.collection("Message");
    const data = await posts.find({}).toArray();
    //for de data para buscar sus mensajes
    for (let i = 0; i < data.length; i++) {
      const query = {
        postId: data[i].id,
      };
      data[i].messages = await messages.find(query).toArray();
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
    const { title, description } = req.body;
    const cliente = client();
    try {
      await cliente.connect();
      const database = cliente.db(process.env.MONGO_DBNAME);
      const posts = database.collection("Posts");
      const data = await posts.insertOne({
        title,
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
      await messages.insertOne({
        postId,
        comment,
        author: req.user,
      });
      res.json({
        status: "success",
        message: "Message added successfully",
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

module.exports = router;
