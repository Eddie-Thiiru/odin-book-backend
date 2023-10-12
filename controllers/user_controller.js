const passport = require("passport");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
require("dotenv/config");

const User = require("../models/user");

// Handle auth
exports.user_auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info.message });
    }

    return res.status(200).json({ message: "Authenticated" });
  })(req, res);
};

// Handle login
exports.user_login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    // custom callback provides custom error message in info
    if (err || !user) {
      return res.status(400).json({
        message: info.message,
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      // generate a signed web token with the contents of user object
      const opts = {};
      opts.expiresIn = "2h";
      const secret = process.env.SECRET_KEY;
      const token = jwt.sign({ user }, secret, opts);

      return res.status(200).json({
        message: "success",
        token: token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          id: user._id,
        },
      });
    });
  })(req, res);
};

// Handle signup
exports.user_signup = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified")
    .isLength({ max: 30 })
    .escape()
    .withMessage("First name must not exceed 30 characters")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name must be specified")
    .isLength({ max: 30 })
    .escape()
    .withMessage("Last name must not exceed 30 characters")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Not a valid email address")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });

      if (user) {
        throw new Error("Email already in use");
      }
    }),
  body("password", "Password must have a minimum of 8 characters")
    .trim()
    .isLength({ min: 8 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        try {
          user.password = hashedPassword;

          await user.save();

          // generate a signed web token with the contents of user object
          const opts = {};
          opts.expiresIn = "2h";
          const secret = process.env.SECRET_KEY;
          const token = jwt.sign({ user }, secret, opts);

          return res.status(200).json({
            message: "success",
            token: token,
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              id: user._id,
            },
          });
        } catch (err) {
          return next(err);
        }
      });
    }
  }),
];

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
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { bio: bio } },
        {}
      );

      res.send(user);
    }
  }),
];
