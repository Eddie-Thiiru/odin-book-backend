const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");

// Display user details
exports.user_detail = asyncHandler(async (req, res, next) => {
  const user = await User.find(
    { _id: req.params.id },
    "firstName lastName profilePicture bio friends friendRequests"
  )
    .populate("friends")
    .populate("friendRequests")
    .exec();

  res.send(user);
});

// Update user profile phot
exports.user_update_photo = [body("profilePhoto")];

// Update user bio
exports.user_update_bio = [
  body("userBio")
    .trim()
    .optional({ values: "falsy" })
    .isLength({ max: 100 })
    .escape()
    .withMessage("Bio should not exceed 100 characters"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bio = req.body.userBio;

    if (!errors.isEmpty()) {
      res.send(422).json({ errors: errors.array()[0].msg });
      return;
    } else {
      const user = User.findByIdAndUpdate(
        req.params.id,
        { $set: { bio: bio } },
        {}
      );

      res.send(user);
    }
  }),
];
