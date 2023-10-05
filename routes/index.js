const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/user_controller");
const post_controller = require("../controllers/post_controller");
const comment_controller = require("../controllers/comment_controller");
const user = require("../models/user");

// GET homepage
router.get("/", post_controller.index);

/// USER ROUTES ///

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

// POST request for new post
router.post("/post", post_controller.create_post);

// PUT request for post likes
router.put("/post", post_controller.update_post_likes);

// DELETE request for post
router.delete("/post", post_controller.delete_post);

/// COMMENT ROUTES ///

// POST request for new comment
router.post("/comment", comment_controller.comment_create);

// DELETE request for comment
router.delete("/comment", comment_controller.comment_delete);

module.exports = router;
