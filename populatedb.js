#! /usr/bin/env node

// Get arguments passed on command line
const useArgs = process.argv.slice(2);
const bcrypt = require("bcryptjs");

const User = require("./models/user");
const Post = require("./models/post");
const Comment = require("./models/comment");

const users = [];
const posts = [];
const comments = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = useArgs[0];

main().catch((err) => {
  console.log(err);
});

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createUsers();
  await createComments();
  await createPosts();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function userCreate(
  index,
  firstName,
  lastName,
  email,
  profilePicture,
  bio,
  friends,
  friendRequests,
  password
) {
  const user = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    profilePicture: profilePicture,
    bio: bio,
    friends: friends,
    friendRequests: friendRequests,
    password: password,
  });

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    try {
      user.password = hashedPassword;

      await user.save();
      users[index] = user;
      console.log(`Added user: ${firstName} ${lastName}`);
    } catch (error) {
      console.log("Password hash error");
    }
  });
}

async function postCreate(index, author, text, comments, likes, timestamp) {
  const post = new Post({
    author: author,
    text: text,
    comments: comments,
    likes: likes,
    timestamp: timestamp,
  });

  await post.save();
  posts[index] = post;
  console.log("Added post");
}

async function commentCreate(index, author, text, post, timestamp) {
  const comment = new Comment({
    author: author,
    text: text,
    post: post,
    timestamp: timestamp,
  });

  await comment.save();
  comments[index] = comment;
  console.log("Added comment");
}

async function createUsers() {
  console.log("Adding users");
  await Promise.all([
    userCreate(
      0,
      "Mario",
      "Bro",
      "mariobrothers@gmail.com",
      "test",
      "I am Mario",
      [],
      [],
      "mariomario"
    ),
    userCreate(
      1,
      "frodo",
      "Baggins",
      "baggins@gmail.com",
      "test",
      "I am Frodo",
      [],
      [],
      "frodofrodo"
    ),
    userCreate(
      2,
      "Balrog",
      "Balrog",
      "balrog@gmail.com",
      "profilePic",
      "I am Balrog",
      [],
      [],
      "balrogbalrog"
    ),
  ]);
}

async function createPosts() {
  console.log("Adding posts");
  await Promise.all([
    postCreate(
      0,
      users[0],
      "Its Frodo's Birthday Today!",
      [comments[0], comments[1]],
      2,
      new Date()
    ),
    postCreate(
      1,
      users[1],
      "Birthday Party!",
      [comments[2], comments[3]],
      2,
      new Date()
    ),
    postCreate(
      2,
      users[2],
      "Looking for friends",
      [comments[4], comments[5]],
      0,
      new Date()
    ),
  ]);
}

async function createComments() {
  console.log("Adding comments");
  await Promise.all([
    commentCreate(
      0,
      users[1],
      "Welcome to baggins end Mario",
      posts[0],
      new Date()
    ),
    commentCreate(1, users[0], "Thanks Frodo", posts[0], new Date()),
    commentCreate(2, users[0], "Happy birthday!", posts[1], new Date()),
    commentCreate(3, users[1], "Thanks!", posts[1], new Date()),
    commentCreate(4, users[2], "I don't bite", posts[2], new Date()),
    commentCreate(
      5,
      users[2],
      "Any friends?, I promise i wont eat you",
      posts[2],
      new Date()
    ),
  ]);
}
