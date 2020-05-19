//schema---------------------------------------------------------
var  mongoose = require("mongoose");
var blogSchema = new mongoose.Schema({
  title: String,
  image: {
    type:String
//    data: Buffer,
//    contentType: String
  },
  desc: String,
    author: {
      type : mongoose.Schema.Types.ObjectId,
      ref : "user"
  },
  comments : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "comment"
    }
  ],
  createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("blog", blogSchema);
//----------------------------------------------------------------