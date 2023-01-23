import TokenService from "../services/Token-service.js";

export const auth_middleware = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new Error();
    }
    const userData = await TokenService.verifyaccessToken(accessToken);
    if (!userData) {
      throw new Error();
    }
    req.user = userData;

    next();
  } catch (error) {
    res.status(401).json("Invalid Token");
    console.log(error);
  }
};
