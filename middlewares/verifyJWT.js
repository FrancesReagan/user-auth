import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;

export default function verifyJWT(req, res, next) {
  let token = req.headers.authorization || req.body.token || req.query.token;
  // Bearer <token> //
  if(token) {
    // taking token spliting from space--remove space--and trimming it so just token returns instead of "bearer and space"
    token = token.split(" ").pop().trim();
  }
if (!token) {
  return res.status(401).json({ message: "no token found "});
}
try {
  // The decoded object will contain the original payload ({ data: { _id, ... } })
  const { data } = jwt.verify(token, secret, { maxAge: '2h' });
  req.user = data; // Attach user data to the request object//

} catch {
  return res.status(401).json({ message: 'Invalid token!' });
}
// Proceed to the next middleware or route handler
  next();

}

// middleware flow:  request or req -> middleware (req.user = data) -> route -> res or response //