import crypto from "crypto";
class HashService {
  hashOTP(data) {
    const hashData = crypto
      .createHmac("sha256", process.env.KEY)
      .update(data)
      .digest("hex");

    return hashData;
  }
}
export default new HashService();
