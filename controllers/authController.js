import axios from "axios";
import { admin, db, auth } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.FIREBASE_API_KEY;

/* -------- SIGNUP -------- */
export const signup = async (req, res) => {
  try {
    const { email, password, name, userCategory } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const user = await auth.createUser({
      email,
      password,
    });

    await db.collection("users").doc(user.uid).set({
      name,
      email,
      userCategory: userCategory || "student",
      role: "student",
      paymentStatus: "paid",
      hasTakenQuiz: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully 🎉",
      uid: user.uid,
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* -------- LOGIN -------- */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    return res.json({
      success: true,
      message: "Login successful 🚀",
      token: response.data.idToken,
      refreshToken: response.data.refreshToken,
      userId: response.data.localId,
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        err.response?.data?.error?.message ||
        "Login failed",
    });
  }
};


/* -------- GET USER PROFILE -------- */
export const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        uid,
        ...userDoc.data(),
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const signOutUser = async (req, res) => {
  try {
    const { uid } = req.body;

    console.log(uid)

    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    // Revoke all refresh tokens (logs user out everywhere)
    await admin.auth().revokeRefreshTokens(uid);

    return res.status(200).json({
      message: "User signed out successfully",
    });
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.body;


    console.log(uid)

    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
};