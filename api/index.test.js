// auth.test.js

const request = require("supertest");
const app = require("./index.js"); // Импортируйте ваше приложение

describe("POST /register", () => {
  it("should register a new user", async () => {
    const response = await request(app.callback()).post("/register").send({
      username: "testuser133332",
      password: "testpassword",
    });

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });
});
