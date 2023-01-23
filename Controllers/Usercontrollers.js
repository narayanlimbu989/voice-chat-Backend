import otpService from "../services/otp-service.js";
import hashService from "../services/hashService.js";
import UserService from "../services/User-service.js";
import TokenService from "../services/Token-service.js";
import { UseDto } from "../dtos/user-dtos.js";

class Authenticate {
  // Send OTP
  async sendOTP(req, res) {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json("phone number is required");
    }
    const OTP = await otpService.generateOTP();

    // hash otp
    const ttl = 1000 * 60 * 5;
    const expire = Date.now() * ttl;
    const data = `${phone}.${OTP}.${expire}`;
    const HashOTP = hashService.hashOTP(data);

    //  send otp
    try {
      await otpService.sendbySMS(phone, OTP);
      return res.status(202).json({
        hash: `${HashOTP}.${expire}`,
        phone,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("message sending failed");
    }
  }

  // verify OTP
  async verify_OTP(req, res) {
    const { otp, phone, hash } = req.body;
    if (!otp || !hash || !phone) {
      res.status(400).json("All field must be provided.");
    }

    const [hashOTP, expire] = hash.split(".");
    if (Date.now() > +expire) {
      res.status(404).json("OTP expires");
    }
    const data = `${phone}.${otp}.${expire}`;

    const isValid = otpService.verifyOTP(hashOTP, data);

    if (!isValid) {
      res.status(404).json("Invalid OTP");
    }
    let USER;

    try {
      // check user
      USER = await UserService.finduser({ phone });
      if (!USER) {
        // if not creating user
        USER = await UserService.createuser({ phone });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json("server error");
    }

    // Token
    const { accessToken, refreshToken } = TokenService.CreateToken({
      _id: USER._id,
      activated: false,
    });

    await TokenService.storefreshtoken(refreshToken, USER._id); //storing in backend

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UseDto(USER);

    res.json({ USER: userDto, auth: true });
  }

  async refresh(req, res) {
    const { refreshToken: refreshTokenfromCookie } = req.cookies;
    // console.log(refreshToken);
    let userData;
    try {
      userData = await TokenService.VerifyrefreshToken(refreshTokenfromCookie);
    } catch (error) {
      return res.status(401).json("Invalid Token");
    }
    try {
      const token = await TokenService.findRefershToken(
        userData._id,
        refreshTokenfromCookie
      );
      if (!token) {
        return res.status(401).json("Invalid Token");
      }
    } catch (error) {
      return res.status(500).json("Enternal Error1");
    }
    const USER = await UserService.finduser({ _id: userData._id });
    if (!USER) {
      return res.status(404).json("no user");
    }
    const { refreshToken, accessToken } = TokenService.CreateToken({
      _id: userData._id,
    });

    try {
      await TokenService.updateRefershToken(userData._id, refreshToken);
    } catch (error) {
      return res.status(500).json("Enternal Error2");
    }
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UseDto(USER);

    res.json({ USER: userDto, auth: true });
  }

  async logout(req, res) {
    const { refreshToken } = req.cookies;
    // delete refresh token from DB
    await TokenService.removeToken(refreshToken);
    // delete cookie
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.json({ USER: null, auth: false });
  }
}
export default new Authenticate();
