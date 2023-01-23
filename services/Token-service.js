import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import refreshmodule from "../Module/RefreshModule.js";
dotenv.config();

const secretToken = process.env.Secret_Token_key;
const RefreshToken = process.env.Secret_Refresh_key;
class Token {
  CreateToken(payload) {
    const accessToken = jwt.sign(payload, secretToken, {
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign(payload, RefreshToken, {
      expiresIn: "1y",
    });
    return { accessToken, refreshToken };
  }
  storefreshtoken(token, userId) {
    try {
      refreshmodule.create({
        token,
        userId,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async verifyaccessToken(accessToken) {
    return jwt.verify(accessToken, secretToken);
  }
  async VerifyrefreshToken(refreshToken) {
    return jwt.verify(refreshToken, RefreshToken);
  }
  async findRefershToken(userId, refreshToken) {
    return await refreshmodule.findOne({ userId: userId, token: refreshToken });
  }
  async updateRefershToken(userId, refreshToken) {
    return await refreshmodule.updateOne(
      { userId: userId },
      { token: refreshToken }
    );
  }

  async removeToken(refreshToken) {
    return await refreshmodule.deleteOne({ token: refreshToken });
  }
}
export default new Token();
