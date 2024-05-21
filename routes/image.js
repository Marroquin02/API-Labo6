const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:imageName", verifyToken, (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = `./fotos/${imageName}.jpg`;

  res.sendFile(imagePath, { root: "." }, (err) => {
    if (err) {
      console.error("Error al enviar la imagen:", err);
      res.status(err.status || 500).json({ message: "Imagen inexistente" });
    }
  });
});

module.exports = router;
