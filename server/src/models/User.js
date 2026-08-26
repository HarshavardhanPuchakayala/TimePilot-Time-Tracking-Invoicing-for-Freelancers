import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
        },
        email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        },
        password: {
            type: String,
            required: true
        },
        businessName: {
  type: String,
},

businessAddress: {
  type: String,
},

gstNumber: {
  type: String,
},
    },
    {
        timestamps: true,
    }

);

const User = mongoose.model("User", userSchema);

export default User;