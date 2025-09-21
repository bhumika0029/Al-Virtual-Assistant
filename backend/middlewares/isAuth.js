import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  const authHeader = req.headers.authorization; // must be "Bearer <token>"
  if (!authHeader) return res.status(401).json({ message: "No token, authorization denied" });

  const token = authHeader.split(" ")[1]; // get the token
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // attach userId to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default isAuth;
