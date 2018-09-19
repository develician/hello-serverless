const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
  title: String,
  body: String
});

// const Story = mongoose.model("Story", StorySchema);

global.Story = global.Story || mongoose.model("Story", StorySchema);
module.exports = global.Story;
