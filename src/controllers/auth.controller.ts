import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken, generateResetToken } from "../utils/jwt.utils";

const prisma = new PrismaClient();

// Register user baru
export const register = async (req: Request, res: Response) => {
  try {
    console.log("Register request body:", req.body);
    const { name, email, phone, password, role = "USER" } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password diperlukan",
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // Validasi format nomor telepon (opsional)
    if (phone) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message:
            "Format nomor telepon tidak valid. Gunakan format: +62/62/0 diikuti 9-13 digit angka",
        });
      }
    }

    // Validasi password (minimal 6 karakter)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password harus minimal 6 karakter",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }
    // Validasi role (hanya admin yang bisa membuat admin)
    let userRole: "USER" | "ADMIN" = "USER";

    if (role === "ADMIN" && req.user && req.user.role === "ADMIN") {
      userRole = "ADMIN";
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: userRole,
      },
    });

    // Generate token
    const token = generateToken(newUser.id, newUser.role);

    // Kirim respons
    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password diperlukan",
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Kirim respons
    res.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

// Mendapatkan profil user
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Pastikan bahwa req.user adalah tipe yang sudah benar
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    
    // Ambil userId sebagai string
    const userId = req.user.userId as string;

    // Query Prisma untuk mencari user berdasarkan ID string
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Menggunakan string untuk ID
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};


// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    console.log("Forgot password request body:", req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email diperlukan",
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Untuk keamanan, tetap kirim respons sukses meskipun email tidak ditemukan
      return res.json({
        success: true,
        message: "Jika email terdaftar, instruksi reset password akan dikirim",
      });
    }

    // Generate token reset password
    const resetToken = generateResetToken();
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 jam

    // Simpan token reset password ke database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp,
      },
    });

    // Kirim email reset password (implementasi sederhana)
    console.log(`
      ====== EMAIL RESET PASSWORD ======
      Kepada: ${email}
      Token: ${resetToken}
      Link: http://localhost:3000/reset-password?token=${resetToken}
      ================================
    `);

    res.json({
      success: true,
      message: "Instruksi reset password telah dikirim ke email Anda",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    console.log("Reset password request body:", req.body);
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token dan password baru diperlukan",
      });
    }

    // Validasi password (minimal 6 karakter)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password harus minimal 6 karakter",
      });
    }

    // Cari user berdasarkan token reset
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password dan hapus token reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    res.json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

// Seed admin (hanya untuk pengembangan)
export const seedAdmin = async (req: Request, res: Response) => {
  try {
    console.log("Seed admin request");

    // Hardcode data admin untuk seed
    const adminData = {
      email: "admin@meesha.co",
      password: "admin123",
      name: "Admin Meesha",
      phone: "081234567890",
    };

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "Admin sudah terdaftar",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Buat admin baru
    const newAdmin = await prisma.user.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        phone: adminData.phone,
        role: "ADMIN",
      },
    });

    // Kirim respons
    res.status(201).json({
      success: true,
      message: "Admin berhasil dibuat",
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        phone: newAdmin.phone,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};
