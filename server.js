import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import usersRouter from "./routes/users.js";


dotenv.config();

const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const app = express();
const PORT = 3000;

// mount middleware//
app.use(express.json()); 
app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  res.send("User Auth API");
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));