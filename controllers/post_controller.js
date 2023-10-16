const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Display list of all posts
exports.index = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find({}, "author text likes comments timestamp")
    .populate("author", "firstName lastName")
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
    .populate({ path: "author", select: "firstName lastName" })
    .sort({ timestamp: -1 })
    .exec();

  res.send(allComments);
});

// Handle post create
exports.create_post = [
  body("text")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Post must not be empty")
    .isLength({ max: 3000 })
    .escape()
    .withMessage("Post should not exceed 3000 characters"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const post = new Post({
      author: req.body.userId,
      text: req.body.text,
      timestamp: new Date(),
    });

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array()[0].msg });
      return;
    } else {
      await post.save();

      res.send(post);
    }
  }),
];

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
