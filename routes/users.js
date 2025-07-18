// MOD 14 LAB 1 ACTIVITY --- add these routes -- they need to be protected--add verifyJWT---//
// everytime--login and get fresh token---make sure verified
// router.get("/:id);
// adding router.get("/allusers") public
// adding router.get("/allusers/protected") with verifyJWT --protected route
// router.patch();
// router.delete();
//? how to generate/store locally the tokens in postman---follow david's guidance//

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


router.get("/profile", verifyJWT, async (req, res) => {
  try {
    console.log("req.user", req.user);
    
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// add verifyJWT here as its where we get a user--to verify here on this route//
// GET current user - protected route---by using the middleware verifyJWT-//
router.get("/", verifyJWT,(req, res) => {
  console.log("USER", req.user); 

  res.json(req.user);
});

// GET all users - public route--list of all users that anyone can see//
// Method: GET//
router.get("/allusers", async (req, res) => {
  try {
    // used the project or .select to not include the password when responding with list//
    const users = await User.find({}).select('-password');
    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
    
  }
});

// GET all users - protected route---list of all users that only authenticated users can see//
// Method: GET//
router.get("/allusers/protected", verifyJWT, async (req, res) => {
  try {
     // used the project or .select to not include the password when responding with list//
    const users = await User.find({}).select("-password");
    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
    
  }
});


// Register new user - public route//
// REGISTER: 
// Method: POST//
router.post("/register", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Login user - public route//
// adding the create token/payload here as login route is the only route that 
// creates the tokens---the other protected routes will utilize or verify the token(s) created here//
// LOGIN --
// method: POST//
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
// method: GET//
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

// update user profile route---protected route//
// method: PATCH//
router.patch("/:id", verifyJWT, async (req,res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
    { new: true }
  ).select("-password");

  if(!updatedUser) {
    return res.status(404).json({ message: "User not found"});
  }
  res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete user --protected route//
// Method: Delete//
router.delete("/:id", verifyJWT, async (req,res) =>{
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id)
    if (!deleteUser) {
      return res.status(404).json({ message: "User not found"});
    }
    res.json({ messaeg: "User deleted successfullly" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
  }
});

export default router;