const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, required: true, minLength: 1, maxLength: 30 },
  lastName: { type: String, required: true, minLength: 1, maxLength: 30 },
  email: { type: String, required: true },
  profilePicture: { type: Buffer },
  bio: { type: String, maxLength: 100 },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  password: { type: String, required: true, minLength: 8 },
});

module.exports = mongoose.model("User", UserSchema);
