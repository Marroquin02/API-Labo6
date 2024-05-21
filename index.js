const express = require("express");
const { verifyToken } = require("./middleware/authMiddleware");
const app = express();

// Middleware
app.use(express.json());

// Routes
const loginRoute = require("./routes/login");
const postRoute = require("./routes/post");

app.use("/login", loginRoute);
app.use("/post", postRoute);

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
