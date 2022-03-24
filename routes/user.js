var express = require("express");
var router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
const HttpError = require("../utils/http-error");

const signToken = (result) => {
  return jwt.sign(
    {
      userId: result._id,
      email: result.email,
      name: result.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new HttpError(
        "User exists already, please login instead.",
        422
      );
      return next(error);
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    const result = await newUser.save();

    let token;
    try {
      token = signToken(result);
    } catch (err) {
      const error = new HttpError("Logging in failed, please try again.", 500);
      return next(error);
    }

    res
      .status(201)
      .json({ userId: result._id, email: result.email, token: token });
  }
);

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email }).select("+password");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    console.log("No User found");
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let isValidPassword;
  try {
    isValidPassword = await bcryptjs.compare(password, existingUser.password);
  } catch (err) {
    console.log("Invalid password");
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  if (!isValidPassword) {
    console.log("Invalid credentials");
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let token;
  try {
    token = signToken(existingUser);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  }

  res.status(200).json({
    userId: existingUser._id,
    email: existingUser.email,
    token: token,
  });
});

module.exports = router;
