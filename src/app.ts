import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./auth/auth.controller";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";

// Memuat variabel lingkungan
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 4000;

// PENTING: Middleware untuk parsing JSON harus dipasang SEBELUM rute
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.18.28:3000"], // Ganti dengan URL frontend yang sesuai
    credentials: true, // Jika kamu mengirimkan cookies atau data otentikasi lainnya
  })
);

// Rute API
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Rute utama
app.get("/", (req, res) => {
  res.send("Selamat datang di API Toko Bunga Meesha");
});

// Memulai server
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
