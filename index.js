const express = require("express");
const mongoose = require("mongoose");

const dotenv = require("dotenv").config();
const postsRouter = require("./routes/post");
const userRouter = require("./routes/user");
const commentsRouter = require("./routes/comment");

const app = express();
app.use(express.json());

app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/comments", commentsRouter);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Db connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server listening on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
