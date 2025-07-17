import express from "express";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import verifyJWT from "../middlewares/verifyJWT.js";

dotenv.config();

const router = express.Router();
// router.user(verifyJWT);---don't need this as only need at routes that need authentication---so adding verifyJWT at specific route levels that need authentication//


const secret = process.env.JWT_SECRET;

const expiration = "2h";

// add verifyJWT here as its where we get a user--to verify here on this route//
// GET current user - protected route//
router.get("/", verifyJWT,(req, res) => {
  console.log("USER", req.user);

  res.json(req.user);
});

// GET all users - public route//
router.get("/allusers", async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
    
  }
});

// Register new user - public route//
router.post("/register", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// MOD 14 LAB 1 ACTIVITY --- add these routes -- they need to be protected--add verifyJWT---//
// everytime--login and get fresh token---make sure verified
// router.get("/:id);
// adding router.get("/allusers") public
// adding router.get("/allusers/protected") with verifyJWT --protected route
// router.patch();
// router.delete();
// how to generate/store locally the tokens in postman---follow david's guidance//


// Login user - public route//
router.post("/login", async (req, res) => {
  const {email, password} = req.body;
  try {
    // find the user by the email//
    const user = await User.findOne({email: email});
    console.log("USER", user);

    if(!user) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    // compare the password with the hashed password//
    const correctPw = await user.isCorrectPassword(password);


   if(!correctPw) {
    return res.status(400).json({ message: "Incorrect email or password" });
   }

  //  create a JWT token//
  // payload -- payload should contain non-sensitive user data//
  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email
  };

  // create token here//
  const token = jwt.sign({ data: payload}, secret, { expiresIn: expiration });


   res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error "});
  }
});

// Get user by ID - protected route//
router.get("/:id", verifyJWT, async (req, res) => {
  try {
  const user = await User.findById(req.params.id).select("-password");

  if(!user) {
    return res.status(404).json({ message: "User not found by id"}); 
  }
  res.json(user);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error "});
}
});

export default router;