const passport = require("passport");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("file");
require("dotenv/config");

const User = require("../models/user");
const Post = require("../models/post");

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

      const userContent = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      // generate a signed web token with user object
      const opts = {};
      opts.expiresIn = "2h";
      const secret = process.env.SECRET_KEY;
      const token = jwt.sign({ userContent }, secret, opts);

      return res.status(200).json({
        message: "success",
        token: token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          id: user._id,
        },
      });
    });
  })(req, res);
};

// Handle guest login
exports.guest_login = (req, res, next) => {
  req.body = { email: "babyyoda@gmail.com", password: "yodababygrogu" };

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

      const userContent = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
      // generate a signed web token with user object
      const opts = {};
      opts.expiresIn = "2h";
      const secret = process.env.SECRET_KEY;
      const token = jwt.sign({ userContent }, secret, opts);

      return res.status(200).json({
        message: "success",
        token: token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          id: user._id,
        },
      });
    });
  })(req, res);
};

// Handle auth
exports.user_auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ message: info.message });
    }

    return res.status(200).json({ message: "Authenticated" });
  })(req, res);
};

// Get user details
exports.user_detail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(
    req.params.id,
    "firstName lastName profilePicture bio friends friendRequests"
  ).exec();

  res.send(user);
});

// Get friend requests
exports.user_requests = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id, "friendRequests")
    .populate({
      path: "friendRequests",
      select: "firstName lastName profilePicture",
    })
    .exec();

  res.send(user.friendRequests);
});

// Get friend suggestions
exports.user_suggestions = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find(
    {},
    "firstName lastName profilePicture friendRequests"
  ).exec();

  const currentUser = await User.findById(
    req.params.id,
    "friends friendRequests"
  ).exec();

  const userFriends = currentUser.friends;
  const userRequests = currentUser.friendRequests;

  // Filter current user
  const userFiltered = allUsers.filter(
    (a) => a._id.toString() !== currentUser._id.toString()
  );

  // Filter sent friend requests
  const sentRequestsFiltered = userFiltered.filter((a) =>
    a.friendRequests.every(
      (b) => b._id.toString() !== currentUser._id.toString()
    )
  );

  // Filter all friends
  const friendsFiltered = sentRequestsFiltered.filter((a) =>
    userFriends.every((b) => b._id.toString() !== a._id.toString())
  );

  // Filter friend requests
  const friendSuggestions = friendsFiltered.filter((a) =>
    userRequests.every((b) => b._id.toString() !== a._id.toString())
  );

  res.send(friendSuggestions);
});

// Get user friends
exports.user_friends = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id, "friends")
    .populate({
      path: "friends",
      select: "firstName lastName profilePicture",
      perDocumentLimit: 9,
    })
    .exec();

  res.send(user.friends);
});

// Get user posts
exports.user_posts = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find(
    { author: req.params.id },
    "author text photo likes comments timestamp"
  )
    .populate("author", "firstName lastName profilePicture")
    .sort({ timestamp: -1 })
    .exec();

  res.send(allPosts);
});

// Add friend request
exports.add_requests = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId).exec();

  await User.findByIdAndUpdate(req.params.requestId, {
    $push: { friendRequests: user },
  });

  res.status(200).json({ message: "success" });
});

// Add friends
exports.add_friends = asyncHandler(async (req, res, next) => {
  // Remove request user from friends request list
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { friendRequests: req.params.requestId },
  });

  // Add both users to each others friends list
  await User.findByIdAndUpdate(req.params.userId, {
    $push: { friends: req.params.requestId },
  });

  await User.findByIdAndUpdate(req.params.requestId, {
    $push: { friends: req.params.userId },
  });

  res.status(200).json({ message: "success" });
});

// Handle signup
exports.user_signup = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified")
    .isLength({ max: 20 })
    .escape()
    .withMessage("First name must not exceed 20 characters")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name must be specified")
    .isLength({ max: 20 })
    .escape()
    .withMessage("Last name must not exceed 20 characters")
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

          const userContent = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          };
          // generate a signed web token with the contents of user object
          const opts = {};
          opts.expiresIn = "2h";
          const secret = process.env.SECRET_KEY;
          const token = jwt.sign({ userContent }, secret, opts);

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

// Update user profile photo
exports.user_update_photo = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(403).json({ message: "forbidden" });
    }

    await User.findByIdAndUpdate(
      req.params.id,
      { $set: { profilePicture: req.file.buffer } },
      {}
    );

    res.status(200).json({ message: "success" });
  });
};

// Update user bio
exports.user_update_bio = [
  body("text")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Bio should not be empty")
    .isLength({ max: 200 })
    .escape()
    .withMessage("Bio should not exceed 200 characters"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bio = req.body.text;

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array()[0].msg });
    } else {
      await User.findByIdAndUpdate(req.params.id, { $set: { bio: bio } }, {});

      res.status(200).json({ message: "success" });
    }
  }),
];

// Delete friend requests
exports.delete_friend_requests = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { friendRequests: req.params.requestId },
  });

  res.status(200).json({ message: "success" });
});

// Delete friends
exports.delete_friends = asyncHandler(async (req, res, next) => {
  // Delete both users from each others friends list
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { friends: req.params.requestId },
  });

  await User.findByIdAndUpdate(req.params.requestId, {
    $pull: { friends: req.params.userId },
  });

  res.status(200).json({ message: "success" });
});
