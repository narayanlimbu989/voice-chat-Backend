import mongoose from "mongoose";

const Userschema = new mongoose.Schema(
  {
    phone: { type: String, require: true },
    name: { type: String, require: false },
    avatar: {
      type: String,
      require: false,
      get: (avatar) => {
        if (avatar) {
          return `${process.env.BASE_URL}${avatar}`;
        }
        return avatar;
      },
    },
    activated: { type: Boolean, require: false, default: false },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);
const User = mongoose.model("User", Userschema, "users");
export default User;
