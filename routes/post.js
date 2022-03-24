var express = require("express");
var router = express.Router();
const { check, validationResult, body } = require("express-validator");

const checkAuth = require("../utils/checkAuth");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const HttpError = require("../utils/http-error");
const Like = require("../models/Like");
const { default: mongoose } = require("mongoose");

router.use(checkAuth);
router.post(
  "/create",
  [check("title").not().isEmpty(), check("content").not().isEmpty()],
  async (req, res, next) => {
    const errors = validationResult(req);
    const { title, content } = req.body;

    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    const newPost = new Post({
      title,
      body: content,
      user: req.userData.userId,
      createdAt: new Date().toISOString(),
    });
    try {
      await newPost.save();
    } catch (err) {
      console.log(err);
      return next(
        new HttpError("Post creation failed, please try again.", 500)
      );
    }
    return res.status(201).json({
      postId: newPost._id,
      title: newPost.title,
      content: newPost.body,
    });
  }
);
router.post("/comment/:postId", async (req, res, next) => {
  const { body } = req.body;
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new HttpError("Post not found", 422));
  }
  const newComment = new Comment({
    body,
    post: postId,
    user: req.userData.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newComment.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Posting comment failed, please try again.", 500)
    );
  }

  return res.status(201).json({ postId, commentId: newComment._id, body });
});
router.post("/like/:postId", async (req, res, next) => {
  const userId = req.userData.userId;
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new HttpError("Post not found", 422));
  }

  const existingLike = await Like.find({
    user: userId,
    type: "Posts",
    refId: postId,
  });

  if (existingLike.length > 0) {
    try {
      await Like.deleteOne({ id: existingLike._id });
    } catch (err) {
      console.log(err);
      return next(
        new HttpError("Liking/Unliking post failed, please try again.", 500)
      );
    }
  } else {
    try {
      const like = new Like({
        user: userId,
        type: "Posts",
        refId: postId,
        createdAt: new Date().toISOString(),
      });
      await like.save();
    } catch (err) {
      return next(
        new HttpError("Liking/Unliking post failed, please try again.", 500)
      );
    }
  }

  let numberOfLikes = await Like.find({ type: "Posts", refId: postId }).count();
  return res.status(201).json({
    postId,
    title: post.title,
    content: post.body,
    numberOfLikes,
  });
});

router.get("/statistics/comments", async (req, res, next) => {
  const posts = await Post.find({ user: req.userData.userId });
  if (posts.length === 0) {
    return res
      .status(200)
      .send("You haven't posted anything. Go ahead create chaos");
  }

  let recentComments = [];

  const userId = mongoose.Types.ObjectId(req.userData.userId);

  try {
    recentComments = await Comment.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "post",
        },
      },
      {
        $unwind: "$post",
      },
      {
        $match: { "post.user": userId },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, please try again.", 500));
  }

  if (recentComments.length > 0) {
    return res.status(200).json({
      recentComments,
    });
  } else {
    return res.status(200).send("No activity on your posts yet.");
  }
});

router.get("/statistics/likes", async (req, res, next) => {
  const posts = await Post.find({ user: req.userData.userId });
  if (posts.length === 0) {
    return res
      .status(200)
      .send("You haven't posted anything. Go ahead create chaos");
  }
  let recentLikes = [];

  const userId = mongoose.Types.ObjectId(req.userData.userId);

  try {
    recentLikes = await Like.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "refId",
          foreignField: "_id",
          as: "post",
        },
      },
      {
        $unwind: "$post",
      },
      {
        $match: { "post.user": userId },
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
    return res.status(200).send("No activity on your posts yet.");
  }
});

module.exports = router;
