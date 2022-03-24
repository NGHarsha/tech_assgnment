const { mongoose } = require("mongoose");

const commentSchema = new mongoose.Schema({
  body: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  createdAt: { type: String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Posts", required: true },
});

module.exports = mongoose.model("Comments", commentSchema);
