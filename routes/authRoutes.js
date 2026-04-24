import express from "express";
import { signup, login, getProfile, signOutUser, getUserByUid } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/signout", signOutUser);
router.post("/user", getUserByUid);

export default router;