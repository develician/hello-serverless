const mongoose = require("mongoose");
const Story = require("./models/Story");

let connection = null;

const connect = () => {
  if (connection && mongoose.connect.readyState === 1) {
    return Promise.resolve(connect);
  }
  return mongoose
    .connect(
      "mongodb://serverless:serverless@ds239128.mlab.com:39128/serverless"
    )
    .then(conn => {
      connection = conn;
      return connection;
    });
};

const createResponse = (status, body) => ({
  statusCode: status,
  body: JSON.stringify(body)
});

exports.createStory = (event, ctx, cb) => {
  ctx.callbackWaitsForEmptyEventLoop = false;
  const { title, body } = JSON.parse(event.body);
  connect()
    .then(() => {
      const story = new Story({ title, body });
      return story.save();
    })
    .then(story => {
      cb(null, createResponse(200, story));
    })
    .catch(e => cb(e));
};

exports.readStories = (event, ctx, cb) => {
  ctx.callbackWaitsForEmptyEventLoop = false;
  connect()
    .then(() =>
      Story.find()
        .sort({ _id: -1 })
        .limit(20)
        .lean()
        .exec()
    )
    .then(stories => cb(null, createResponse(200, stories)));
};

exports.readStory = (event, ctx, cb) => {
  ctx.callbackWaitsForEmptyEventLoop = false;
  connect()
    .then(() => Story.findById(event.pathParameters.id).exec())
    .then(story => {
      if (!story) {
        return cb(null, { statusCode: 404 });
      }
      cb(null, createResponse(200, story));
    });
};

// 스토리 수정
exports.updateStory = (event, ctx, cb) => {
  ctx.callbackWaitsForEmptyEventLoop = false;
  const update = JSON.parse(event.body);
  connect()
    .then(() =>
      Story.findByIdAndUpdate(event.pathParameters.id, update, {
        new: true
      }).exec()
    )
    .then(story => {
      if (!story) {
        return cb(null, { statusCode: 404 });
      }

      cb(null, createResponse(200, story));
    });
};

// 스토리 삭제
exports.deleteStory = (event, ctx, cb) => {
  ctx.callbackWaitsForEmptyEventLoop = false;
  connect()
    .then(() => Story.findByIdAndRemove(event.pathParameters.id).exec())
    .then(() => cb(null, createResponse(204, null)));
};
