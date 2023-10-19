const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, minLength: 1, maxLength: 3000, required: true },
  photo: { type: Buffer },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: true }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  timestamp: { type: Date },
});

module.exports = mongoose.model("Post", PostSchema);
