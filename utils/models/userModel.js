import mongoose, { model, Schema } from "mongoose";

const Userschema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },

    profileImageUrl: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);

const userModel = new model("user", Userschema);

export default userModel;
