import crypto from "crypto";
import HashService from "./hashService.js";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const smsSID = process.env.SID;
const AUTHTOKEN = process.env.AUTH_TOKEN;

class otpService {
  async generateOTP() {
    const OTP = crypto.randomInt(1000, 9999);
    return OTP;
  }
  async sendbySMS(phone, OTP) {
    const TWILIO = twilio(smsSID, AUTHTOKEN, { lazyLoading: true });
    return await TWILIO.messages.create({
      to: phone,
      from: process.env.PHONE,
      body: `Your V-CHAT OTP code is ${OTP}`,
    });
  }
  verifyOTP(hashOTP, data) {
    let compuatedHash = HashService.hashOTP(data);
    if (compuatedHash === hashOTP) {
      return true;
    }
    return false;
  }
}
export default new otpService();
