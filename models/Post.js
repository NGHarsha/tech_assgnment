const { mongoose } = require("mongoose");
const Comment = require("./Comment");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  createdAt: { type: String, required: true },
});

// postSchema.pre("remove", async function (next) {
//   try {
//     console.log("Pre remove hook of Post");
//     await Comment.deleteMany({ post: this._id });
//     next();
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// });

module.exports = mongoose.model("Posts", postSchema);
