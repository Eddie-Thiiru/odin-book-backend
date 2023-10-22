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

// POST request for guest login
router.post("/login/guest", user_controller.guest_login);

// POST request for user sign in
router.post("/signup", user_controller.user_signup);

// GET request for user details
router.get("/profile/:id", user_controller.user_detail);

// GET request for friend requests
router.get("/profile/:id/requests", user_controller.user_requests);

// GET request for friend suggestions
router.get("/profile/:id/suggestions", user_controller.user_suggestions);

// GET request for user friends
router.get("/profile/:id/friends", user_controller.user_friends);

// GET request for user posts
router.get("/profile/:id/posts", user_controller.user_posts);

// POST request for user photo
router.post("/profile/:id/photo", user_controller.user_update_photo);

// POST request for user bio
router.post("/profile/:id/bio", user_controller.user_update_bio);

// PUT request to send friend requests
router.put(
  "/profile/:userId/requests/:requestId",
  user_controller.add_requests
);

// PUT request to accept friends requests
router.put("/profile/:userId/friends/:requestId", user_controller.add_friends);

// DELETE request to unfriend a user
router.delete(
  "/profile/:userId/friends/:requestId",
  user_controller.delete_friends
);

// DELETE request to remove friend requests
router.delete(
  "/profile/:userId/requests/:requestId",
  user_controller.delete_friend_requests
);

/// POSTS ROUTES ///

// GET homepage
router.get("/post", post_controller.index);

// GET request for post comments
router.get("/post/:id/comments", post_controller.post_comments);

// POST request for new post
router.post("/post", post_controller.create_post);

// POST request for post likes
router.post("/post/:id/likes", post_controller.create_post_like);

// DELETE request for post likes
router.delete("/post/:postId/likes/:likeId", post_controller.delete_post_like);

// DELETE request for post
router.delete("/post/:id", post_controller.delete_post);

/// COMMENT ROUTES ///

// POST request for new comment
router.post("/post/:id/comments", comment_controller.comment_create);

// DELETE request for comment
router.delete(
  "/post/:postId/comments/:commentId",
  comment_controller.comment_delete
);

module.exports = router;
