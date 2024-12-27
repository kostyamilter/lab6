const ratelimit = require("koa-ratelimit");

const rateLimit = ratelimit({
  driver: "memory",
  db: new Map(),
  duration: 60000,
  max: 10,
  message: "Too many requests, please try again later.",
});
module.exports = { rateLimit };
