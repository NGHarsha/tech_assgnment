var express = require("express");
var router = express.Router();

const checkAuth = require("../utils/checkAuth");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const HttpError = require("../utils/http-error");
const Like = require("../models/Like");
const { default: mongoose } = require("mongoose");

router.use(checkAuth);

router.post("/like/:commentId", async (req, res, next) => {
  const userId = req.userData.userId;
  const commentId = req.params.commentId;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new HttpError("Comment not found", 422));
  }

  const existingLike = await Like.find({
    user: userId,
    type: "Comments",
    refId: commentId,
  });

  if (existingLike.length > 0) {
    try {
      await Like.deleteOne({ id: existingLike._id });
    } catch (err) {
      console.log(err);
      return next(
        new HttpError("Liking/Unliking comment failed, please try again.", 500)
      );
    }
  } else {
    try {
      const like = new Like({
        user: userId,
        type: "Comments",
        refId: commentId,
        createdAt: new Date().toISOString(),
      });
      await like.save();
    } catch (err) {
      return next(
        new HttpError("Liking/Unliking comment failed, please try again.", 500)
      );
    }
  }

  let numberOfLikes = await Like.find({
    type: "Comments",
    refId: commentId,
  }).count();
  return res.status(201).json({
    commentId,
    body: comment.body,
    numberOfLikes,
  });
});

router.get("/statistics/likes", async (req, res, next) => {
  const comments = await Comment.find({ user: req.userData.userId });
  if (comments.length === 0) {
    return res
      .status(200)
      .send("You haven't commented on anything. Go ahead create chaos");
  }

  let recentLikes = [];

  const userId = mongoose.Types.ObjectId(req.userData.userId);

  try {
    recentLikes = await Like.aggregate([
      {
        $lookup: {
          from: "comments",
          localField: "refId",
          foreignField: "_id",
          as: "comment",
        },
      },
      {
        $unwind: "$comment",
      },
      {
        $match: { "comment.user": userId },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  } catch (err) {
    return next(new HttpError("Something went wrong, please try again.", 500));
  }

  if (recentLikes.length > 0) {
    return res.status(200).json({
      recentLikes,
    });
  } else {
    return res.status(200).send("No activity on your comments yet.");
  }
});

module.exports = router;
