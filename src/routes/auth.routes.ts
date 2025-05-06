import express from "express";
import {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  seedAdmin,
} from "../controllers/auth.controller";  // Pastikan semua diekspor
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware";

const router = express.Router();

// Rute publik
router.post("/register", register);  // Registrasi user
router.post("/login", login);        // Login user
router.post("/forgot-password", forgotPassword); // Forgot password
router.post("/reset-password", resetPassword);   // Reset password

// Rute terproteksi
router.get("/profile", authenticate, getProfile); // Mendapatkan profil user

// Rute admin
router.post("/register-admin", authenticate, authorizeAdmin, register); // Registrasi admin baru

// Rute khusus pengembangan - untuk memudahkan pengujian
router.get("/seed-admin", seedAdmin); // Seed admin untuk pengembangan

export default router;
