import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { v2 as cloudinary } from "cloudinary"

const prisma = new PrismaClient()

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Mendapatkan semua produk
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, search } = req.query

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId as string
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search as string,
            mode: "insensitive",
          },
        },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(products)
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Terjadi kesalahan pada server" })
  }
}

// Mendapatkan produk berdasarkan ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID sekarang menggunakan string, tidak perlu di-parse

    // Pastikan ID produk bertipe string sesuai dengan definisi Prisma
    const product = await prisma.product.findUnique({
      where: { id }, // Menggunakan id bertipe string
      include: {
        category: true,  // Menyertakan kategori yang terkait
      },
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Produk tidak ditemukan" });
    }
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Membuat produk baru
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, categoryId } = req.body
    const file = req.file

    if (!name || !price) {
      return res.status(400).json({ message: "Nama dan harga produk diperlukan" })
    }

    let imageUrl = null

    // Upload gambar jika ada
    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "meesha-products",
          },
          (error, result) => {
            if (error) return reject(error)
            resolve(result)
          },
        )

        // @ts-ignore
        uploadStream.end(file.buffer)
      })

      imageUrl = result.secure_url
    }

    // Buat produk dengan field yang ada di model
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: stock ? Number(stock) : 0,
        categoryId: categoryId || null,
        // imageUrl tidak ada di model
      },
      include: {
        category: true,
      },
    })

    // Kirim respons dengan data produk dan tambahan informasi
    res.status(201).json({
      ...product,
      imageUrl: imageUrl, // Tambahkan sebagai informasi tambahan di respons
    })
  } catch (error) {
    console.error("Create product error:", error)
    res.status(500).json({ message: "Terjadi kesalahan pada server" })
  }
}

// Mengupdate produk
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;  // ID sekarang bertipe string, tidak perlu di-parse

    // Cek apakah produk ada
    const productExists = await prisma.product.findUnique({
      where: { id },  // Menggunakan id bertipe string
    });

    if (!productExists) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const { name, description, price, stock, categoryId } = req.body;
    const file = req.file;

    let imageUrl: string | undefined = undefined;

    // Upload gambar baru jika ada
    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "meesha-products", // Folder di Cloudinary
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        // @ts-ignore
        uploadStream.end(file.buffer);
      });

      imageUrl = result.secure_url;
    }

    // Update produk dengan field yang ada di model
    const product = await prisma.product.update({
      where: { id }, // Menggunakan id bertipe string
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? Number(price) : undefined,
        stock: stock ? Number(stock) : undefined,
        categoryId: categoryId || null,
        imageUrl: imageUrl || productExists.imageUrl,  // Update imageUrl jika ada gambar baru
      },
      include: {
        category: true,
      },
    });

    // Kirim respons dengan data produk dan informasi gambar jika ada
    res.json({
      ...product,
      imageUrl: imageUrl || productExists.imageUrl,  // Menambahkan imageUrl jika ada
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Menghapus produk
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;  // ID sekarang bertipe string, tidak perlu di-parse

    // Cek apakah produk ada
    const productExists = await prisma.product.findUnique({
      where: { id },  // Menggunakan id bertipe string
    });

    if (!productExists) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Hapus produk
    await prisma.product.delete({
      where: { id },  // Menggunakan id bertipe string
    });

    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};