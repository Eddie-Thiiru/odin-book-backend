const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/user_controller");
const post_controller = require("../controllers/post_controller");
const comment_controller = require("../controllers/comment_controller");

/// USER ROUTES ///

// GET request for use auth
router.get("/isUserAuth", user_controller.user_auth);

// POST request for user login
router.post("/login", user_controller.user_login);

// POST request for user sign in
router.post("/signup", user_controller.user_signup);

// GET request for user details
router.get("/profile/:id", user_controller.user_detail);

// POST request for user photo
router.post("/profile/:id/photo", user_controller.user_update_photo);

// POST request for user bio
router.post("/profile/:id/bio", user_controller.user_update_photo);

/// POSTS ROUTES ///

// GET homepage
router.get("/post", post_controller.index);

// GET request for post comments
router.get("/post/:id/comments", post_controller.post_comments);

// POST request for new post
router.post("/post", post_controller.create_post);

// POST request for post likes
router.post("/post/:id/like", post_controller.create_post_like);

// DELETE request for post
router.delete("/post", post_controller.delete_post);

/// COMMENT ROUTES ///

// POST request for new comment
router.post("/post/:id/comment", comment_controller.comment_create);

// DELETE request for comment
router.delete("/comment", comment_controller.comment_delete);

module.exports = router;
