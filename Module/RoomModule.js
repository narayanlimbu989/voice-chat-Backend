import mongoose, { Schema } from "mongoose";

const Roomschema = new mongoose.Schema(
  {
    topic: { type: String, require: true },
    roomType: { type: String, require: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    speakers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: false
    },
  },
  {
    timestamps: true,
  }
);
const Room = mongoose.model("Room", Roomschema, "rooms");
export default Room;
