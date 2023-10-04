const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

// Display list of all posts
exports.post_list = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find()
    .populate("author")
    .populate("comments")
    .exec();

  res.send(allPosts);
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
      author: req.user._id,
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

// Handle update
exports.update_post_likes = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).exec();

  const newLikes = post.likes + 1;

  await post.findByIdAndUpdate(
    req.params.id,
    { $set: { likes: newLikes } },
    {}
  );

  res.send(post);
});

// Handle delete
exports.delete_post = asyncHandler(async (req, res, next) => {
  const [post, allPostComments] = await Promise.all([
    Post.findById(req.params.id).exec(),
    Comment.find({ post: req.params.id }).exec(),
  ]);

  if (post) {
    await post.findByIdAndDelete(req.params.id);

    if (allPostComments) {
      await allPostComments.deleteMany({ post: req.params.id });
    }

    res.send(post);
  }
});
