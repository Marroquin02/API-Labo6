const express = require("express");
const fs = require("fs");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/getall", verifyToken, async (req, res) => {
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const posts = database.collection("Posts");
    const messages = database.collection("Message");
    const data = await users.find({}).toArray();
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
  }
});

router.post("/add", verifyToken, async (req, res) => {
  const { title, description } = req.body;
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const posts = database.collection("Posts");
    const data = await posts.insertOne({
      title,
      description,
      author,
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
  }
});

router.post("/addcomment", verifyToken, async (req, res) => {
  const { postId, comment } = req.body;
  const cliente = client();
  try {
    await cliente.connect();
    const database = cliente.db(process.env.MONGO_DBNAME);
    const messages = database.collection("Message");
    const data = await messages.insertOne({
      postId,
      comment,
      author,
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
  }
});

module.exports = router;
