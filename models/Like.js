const { mongoose } = require("mongoose");

const likeSchema = new mongoose.Schema({
  type: { type: String, enum: ["Posts", "Comments"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  createdAt: { type: String, required: true },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "type",
  },
});

module.exports = mongoose.model("Likes", likeSchema);
