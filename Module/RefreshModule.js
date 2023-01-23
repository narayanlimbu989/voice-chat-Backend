import mongoose, { Schema } from "mongoose";

const Refreshschema = new mongoose.Schema(
  {
    token: { type: String, require: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" }, //ref===> take value from modul
  },
  {
    timestamps: true,
  }
);
const refreshmodule = mongoose.model("Refresh", Refreshschema, "tokens");
export default refreshmodule;
