const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, minLength: 1, maxLength: 1000, required: true },
  post: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  timestamp: { type: String },
});

module.exports = mongoose.model("Comment", CommentSchema);
