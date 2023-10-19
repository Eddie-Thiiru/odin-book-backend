const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).any();

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Display list of all posts
exports.index = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find(
    {},
    "author text photo likes comments timestamp"
  )
    .populate("author", "firstName lastName profilePicture")
    .sort({ timestamp: -1 })
    .exec();

  res.send(allPosts);
});

// Handle post comments fetch
exports.post_comments = asyncHandler(async (req, res, next) => {
  const allComments = await Comment.find(
    { post: req.params.id },
    "author post text timestamp"
  )
    .populate({ path: "author", select: "firstName lastName profilePicture" })
    .exec();

  res.send(allComments);
});

// Handle post create
exports.create_post = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(403).json({ message: "forbidden" });
    }

    const post = new Post({
      author: req.body.userId,
      text: req.body.text,
      timestamp: new Date(),
    });

    if (req.files.length > 0) {
      post.photo = req.files[0].buffer;
    }

    await post.save();

    res.status(200).json({ message: "success" });
  });
};

// Handle likes update
exports.create_post_like = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.body.userId).exec();

  await Post.findByIdAndUpdate(req.params.id, {
    $push: { likes: user },
  });

  res.status(200).json({ message: "success" });
});

// Handle likes delete
exports.delete_post_like = asyncHandler(async (req, res, next) => {
  await Post.findByIdAndUpdate(req.params.postId, {
    $pull: { likes: req.params.likeId },
  });

  res.status(200).json({ message: "success" });
});

// Handle delete
exports.delete_post = asyncHandler(async (req, res, next) => {
  await Post.findByIdAndDelete(req.params.id);

  await Comment.deleteMany({ post: req.params.id });

  res.status(200).json({ message: "success" });
});
