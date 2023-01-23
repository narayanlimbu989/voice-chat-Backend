import Jimp from "jimp";
import { Buffer } from "buffer";
import path from "path";
import UserService from "../services/User-service.js";
import { UseDto } from "../dtos/user-dtos.js";
import dotenv from "dotenv";
dotenv.config();

class ActivateController {
  async activate(req, res) {
    const { userName, userPic } = req.body;
    if (!userName || !userPic) {
      res.status(400).json("All fields are required");
    }
    const buferconvert = Buffer.from(
      userPic.replace(/^data:image\/(jpeg|jpg|png);base64,/, ""),
      "base64"
    );

    const imagepath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

    try {
      const jimpresponse = await Jimp.read(buferconvert);
      jimpresponse
        .resize(150, Jimp.AUTO)
        .write(path.resolve(`./storage/${imagepath}`));
    } catch (error) {
      res.status(500).json("could not process the image");
      console.log(error);
    }

    const userId = req.user._id;

    // user update
    try {
      const User = await UserService.finduser({ _id: userId });
      if (!User) {
        res.status(404).json("user not found");
      }

      User.activated = true;
      User.name = userName;
      User.avatar = `/storage/${imagepath}`;
      User.save();
      res.json({ USER: new UseDto(User), auth: true });
    } catch (error) {
      res.status(500).json("Db error");
    }
  }
}
export default new ActivateController();
