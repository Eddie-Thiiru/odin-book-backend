const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, minLength: 1, maxLength: 3000, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: true }],
  likes: { type: Number, default: 0 },
  timestamp: { type: String },
});

module.exports = mongoose.model("Post", PostSchema);
