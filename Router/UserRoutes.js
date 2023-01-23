import express from "express"
import Authcenticate from "../Controllers/Usercontrollers.js"
import ActivateController from "../Controllers/ActivateController.js"
import { auth_middleware } from "../Middleware/auth-middleware.js";
import roomscontroller from "../Controllers/roomscontroller.js";
const router=express.Router();

router.post("/api/send-otp",Authcenticate.sendOTP)
router.post("/api/verify-otp",Authcenticate.verify_OTP)
router.post("/api/activate",auth_middleware,ActivateController.activate)
router.get("/api/refresh",Authcenticate.refresh)
router.post("/api/logout",auth_middleware,Authcenticate.logout)
router.post("/api/rooms",auth_middleware,roomscontroller.create)
router.get("/api/rooms",auth_middleware,roomscontroller.getroom)
router.get("/api/rooms/:roomId",auth_middleware,roomscontroller.show)


export default router