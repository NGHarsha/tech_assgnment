const HttpError = require("./http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //console.log(req.headers.authorization);
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    // console.log(token);
    if (!token) {
      return next(new HttpError("Authorization failed", 401));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError("Authorization failed", 401));
  }
};
