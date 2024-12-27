const jwt = require("jsonwebtoken");

const JWT_SECRET = "123";

const verifyToken = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(" ")[1];

  if (!token) {
    ctx.status = 401;
    ctx.body = { message: "No token provided" };
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { message: "Invalid or expired token" };
  }
};
module.exports = { verifyToken };
