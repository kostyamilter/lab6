// auth.js

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const JWT_SECRET = "123";
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const hashPassword = (password) => bcrypt.hashSync(password, 10);

const checkPassword = (password, hash) => bcrypt.compareSync(password, hash);

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

const registerUser = async (ctx) => {
  const { username, password } = ctx.request.body;

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    ctx.status = 400;
    ctx.body = { message: "User already exists" };
    return;
  }

  const hashedPassword = hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  const { accessToken, refreshToken } = generateTokens(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  ctx.status = 201;
  ctx.body = { accessToken, refreshToken };
};

const loginUser = async (ctx) => {
  const { username, password } = ctx.request.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !checkPassword(password, user.password)) {
    ctx.status = 401;
    ctx.body = { message: "Invalid credentials" };
    return;
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  ctx.status = 200;
  ctx.body = { accessToken, refreshToken };
};

 const refreshTokens = async (ctx) => {
  const { refreshToken } = ctx.request.body;

  if (!refreshToken) {
    ctx.status = 400;
    ctx.body = { message: "Refresh token is required" };
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== refreshToken) {
      ctx.status = 401;
      ctx.body = { message: "Invalid refresh token" };
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    ctx.status = 200;
    ctx.body = { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    ctx.status = 401;
    ctx.body = { message: "Invalid refresh token" };
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
};
