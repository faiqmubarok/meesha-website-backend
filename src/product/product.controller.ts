import express from "express";
import { Request, Response } from "express";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("imageUrl");
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  getMetaService,
} from "./product.service";
import { Product, ProductFilter, UpdateProductInput } from "../types/product";
import { Size } from "@prisma/client";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, categories, types, objectives, colors, size, page } =
      req.query;

    // Ubah string ke number, dan hindari NaN
    const gte =
      typeof req.query.gte === "string" && !isNaN(Number(req.query.gte))
        ? Number(req.query.gte)
        : undefined;
    const lte =
      typeof req.query.lte === "string" && !isNaN(Number(req.query.lte))
        ? Number(req.query.lte)
        : undefined;

    const priceFilter =
      gte !== undefined || lte !== undefined ? { gte, lte } : undefined;

    const filters: ProductFilter = {
      search: search as string,
      category: categories as string[],
      type: types as string[],
      objective: objectives as string[],
      color: colors as string[],
      size: size as Size[],
      price: priceFilter,
      page: page ? Number(page) : undefined,
    };

    const products = await getAllProductsService(filters);

    res.status(200).json({ data: products });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

router.get("/meta", async (req: Request, res: Response) => {
  try {
    const meta = await getMetaService();
    return res.json(meta);
  } catch (error) {
    console.error("Error fetching meta data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await getProductByIdService(req.params.id);
    res.status(200).json({ data: product });
  } catch (error: any) {
    res.status(404).json({ error: error.message || "Product not found" });
  }
});

router.post("/", upload, async (req, res) => {
  try {
    const raw = req.body;

    const parsedData = {
      ...raw,
      price: Number(raw.price),
      stock: Number(raw.stock),
      variant: JSON.parse(raw.variant),
      category: JSON.parse(raw.category),
      type: JSON.parse(raw.type),
      objective: JSON.parse(raw.objective),
      color: JSON.parse(raw.color),
    };

    const file = req.file;

    const product = await createProductService(parsedData, file);

    res.status(201).json({
      data: product,
      message: "Product created successfully",
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || "Bad Request" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deletedProduct = await deleteProductService(req.params.id);
    res
      .status(200)
      .json({ data: deletedProduct, message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(404).json({ error: error.message || "Product not found" });
  }
});

router.put("/:id", upload, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const parsedData = {
      ...body,
      price: Number(body.price),
      stock: Number(body.stock),
      variant: JSON.parse(body.variant),
      category: JSON.parse(body.category),
      type: JSON.parse(body.type),
      objective: JSON.parse(body.objective),
      color: JSON.parse(body.color),
    };

    console.log("data masuk");

    const file = req.file;

    const {
      name,
      price,
      stock,
      description,
      size,
      variant,
      category,
      type,
      objective,
      color,
    } = parsedData;

    console.log("data parse", parsedData, file);

    if (
      !name ||
      !price ||
      !stock ||
      !description ||
      !size ||
      !variant ||
      !category ||
      !type ||
      !objective ||
      !color
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    console.log("berhasil validasi");

    const payload: Omit<Product, "id"> = {
      name,
      price,
      stock,
      description,
      size,
      variant,
      category,
      type,
      objective,
      color,
    };

    const updated = await updateProductService(req.params.id, payload, file);
    return res.status(200).json({
      data: updated,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(400)
      .json({ error: error.message || "Something went wrong" });
  }
});

router.patch("/:id", upload, async (req: Request, res: Response) => {
  try {
    const updatedProduct = await updateProductService(
      req.params.id,
      req.body,
      req.file
    );
    res
      .status(200)
      .json({ data: updatedProduct, message: "Product updated successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Bad Request" });
  }
});

export default router;
