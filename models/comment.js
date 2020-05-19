//schema---------------------------------------------------------
var  mongoose = require("mongoose");
var commentSchema = new mongoose.Schema({
  content: String,
    author: {
      type : mongoose.Schema.Types.ObjectId,
      ref : "user"
  },
  createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("comment", commentSchema);
//----------------------------------------------------------------