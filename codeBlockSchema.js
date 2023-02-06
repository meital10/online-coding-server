const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const codeBlockSchema = new Schema({
  title: {
    type: String,
  },
  code: {
    type: String,
  },
});

const CodeBlock = mongoose.model("CodeBlock", codeBlockSchema);

module.exports = CodeBlock;
