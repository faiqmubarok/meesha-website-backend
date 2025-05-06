import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { v2 as cloudinary } from "cloudinary"

const prisma = new PrismaClient()

// Mendapatkan semua kategori
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    })

    res.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Terjadi kesalahan pada server" })
  }
}

// Mendapatkan kategori berdasarkan ID
// Mendapatkan kategori berdasarkan ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;  // ID sekarang menggunakan string, tidak perlu di-parse

    // Pastikan untuk menyertakan relasi 'products'
    const category = await prisma.category.findUnique({
      where: { id },  // Menggunakan id dengan tipe string
      include: {
        products: true,  // Mendapatkan produk yang terkait dengan kategori
      },
    });

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
  

// Membuat kategori baru
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name) {
      return res.status(400).json({ message: "Nama kategori diperlukan" });
    }

    let image = null;

    // Upload gambar jika ada
    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "meesha-categories",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });

      image = result.secure_url;
    }

    const category = await prisma.category.create({
      data: {
        name,
        image,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Memperbarui kategori
// Memperbarui kategori
export const updateCategory = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;  // ID sekarang menggunakan string, tidak perlu di-parse
  
      const { name } = req.body
      const file = req.file
  
      if (!name) {
        return res.status(400).json({ message: "Nama kategori diperlukan" })
      }
  
      // Cek apakah kategori ada
      const categoryExists = await prisma.category.findUnique({
        where: { id },  // Menggunakan id dengan tipe string
      })
  
      if (!categoryExists) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" })
      }
  
      let image = undefined
  
      // Upload gambar baru jika ada
      if (file) {
        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "meesha-categories",
            },
            (error, result) => {
              if (error) return reject(error)
              resolve(result)
            },
          )
  
          // @ts-ignore
          uploadStream.end(file.buffer)
        })
  
        image = result.secure_url
      }
  
      // Update kategori dengan field yang ada di model
      const category = await prisma.category.update({
        where: { id },  // Menggunakan id dengan tipe string
        data: {
          name,
          image,  // Pastikan untuk menyertakan image jika ada
        },
      })
  
      // Kirim respons dengan data kategori dan tambahan informasi
      res.json({
        ...category,
        image: image || undefined, // Tambahkan sebagai informasi tambahan di respons
      })
    } catch (error) {
      console.error("Update category error:", error)
      res.status(500).json({ message: "Terjadi kesalahan pada server" })
    }
  }

// Menghapus kategori
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;  // ID sekarang bertipe string, langsung ambil dari params

    // Cek apakah kategori ada dan apakah memiliki produk
    const category = await prisma.category.findUnique({
      where: { id }, // Menggunakan id bertipe string
      include: {
        products: true,  // Menyertakan produk yang terkait dengan kategori
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    // Cek apakah kategori memiliki produk
    if (category.products && category.products.length > 0) {
      return res.status(400).json({
        message: "Kategori tidak dapat dihapus karena masih memiliki produk",
      });
    }

    // Hapus kategori
    await prisma.category.delete({
      where: { id },  // Menggunakan id bertipe string
    });

    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
