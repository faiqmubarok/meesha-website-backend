import express from "express";
import { Request, Response } from "express";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  getMetaService,
} from "./product.service";
import { ProductFilter, UpdateProductInput } from "../types/product";
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

router.post("/", async (req: Request, res: Response) => {
  const data = req.body;
  try {
    if (!data.name) {
      throw new Error("Name are required");
    }
    const product = await createProductService(data);
    res
      .status(201)
      .json({ data: product, message: "Product created successfully" });
  } catch (error: any) {
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

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      stock,
      description,
      imageUrl,
      size,
      variant,
      categoryId,
      typeId,
      objectiveId,
      colorId,
    } = req.body;

    if (
      !name ||
      !price ||
      !stock ||
      !description ||
      // !imageUrl ||
      !size ||
      !variant ||
      !categoryId ||
      !typeId ||
      !objectiveId ||
      !colorId
    ) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    const allowedSizes = ["S", "M", "L", "XL", "XXL"];
    if (!allowedSizes.includes(size)) {
      return res.status(400).json({ error: "Ukuran tidak valid" });
    }

    const payload: UpdateProductInput = {
      name,
      price,
      stock,
      description,
      imageUrl,
      size,
      variant,
      categoryId,
      typeId,
      objectiveId,
      colorId,
    };

    const updated = await updateProductService(req.params.id, payload);
    return res.status(200).json({
      data: updated,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    return res
      .status(400)
      .json({ error: error.message || "Something went wrong" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const updatedProduct = await updateProductService(req.params.id, req.body);
    res
      .status(200)
      .json({ data: updatedProduct, message: "Product updated successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Bad Request" });
  }
});

export default router;
