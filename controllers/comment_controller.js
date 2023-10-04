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
    .isLength({ max: 3000 })
    .escape()
    .withMessage("Comment should not exceed 1000 characters"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    console.log(req.params);

    const comment = new Comment({
      author: req.user._id,
      text: req.body.text,
      // post: "",
      timestamp: new Date(),
    });

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array()[0].msg });
    } else {
      await comment.save();

      res.send(comment);
    }
  }),
];

// Handle comment delete
exports.comment_delete = asyncHandler(async (req, res, next) => {
  console.log(req.params);

  // const comment = await Comment.findById(req.params.id).exec();
  // if (comment) {
  //   await comment.findByIdAndDelete(req.params.id);
  // }
});
