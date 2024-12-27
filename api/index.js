// app.js

const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { registerUser, loginUser, refreshTokens } = require("./auth.js");
const { verifyToken } = require("./middleware.js");
const { rateLimit } = require("./rateLimit.js");

const app = new Koa();
const router = new Router();

app.use(bodyParser());

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshTokens);

router.get("/profile", verifyToken, rateLimit, (ctx) => {
  ctx.body = { message: "Protected route", user: ctx.state.user };
});

app.use(router.routes()).use(router.allowedMethods());

module.exports = app;
