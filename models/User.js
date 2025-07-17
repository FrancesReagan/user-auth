import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
 
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Must match an email address!"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

// method to check if passwords are the same--compare the passwords//
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password)
}


// Set up pre-save bcrypt middleware to create password//
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});
 

const User = model("User", userSchema);
 
export default User;