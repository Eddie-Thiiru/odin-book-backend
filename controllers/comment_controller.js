const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

// Handle comment create
exports.comment_create = [
  body("text")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Comment must not be empty")
    .isLength({ max: 1000 })
    .escape()
    .withMessage("Comment should not exceed 1000 characters"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const comment = new Comment({
      author: req.body.userId,
      text: req.body.text,
      post: req.params.id,
      timestamp: new Date(),
    });

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array()[0].msg });
    } else {
      // Add comment to db and update parent post
      await comment.save();
      await Post.findByIdAndUpdate(req.params.id, {
        $push: { comments: comment },
      });

      // Fetch all comments after save
      const allComments = await Comment.find(
        { post: req.params.id },
        "author post text timestamp"
      )
        .populate({ path: "author", select: "firstName lastName" })
        .sort({ timestamp: -1 })
        .exec();

      res.send(allComments);
    }
  }),
];

// Handle comment delete
exports.comment_delete = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  // const comment = await Comment.find(req.params.id).exec();
  // if (comment) {
  //   await comment.findByIdAndDelete(req.params.id);
  // }
});
