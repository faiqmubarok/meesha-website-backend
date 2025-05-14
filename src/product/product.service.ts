import {
  createProduct,
  deleteProduct,
  findProductById,
  getAllCategories,
  getAllColors,
  getAllObjectives,
  getAllProducts,
  getAllTypes,
  updateProduct,
} from "./product.repository";
import { Product, ProductFilter } from "../types/product";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "./cloudinary.service";
import { getCachedData, setCachedData } from "../utils/cache";

export const createProductService = async (
  data: Product,
  file: Express.Multer.File | undefined
) => {
  const existing = await getAllProducts({ name: data.name });
  if (existing.length > 0) {
    throw new Error("Product with this name already exists");
  }

  let imageUrl = undefined;
  if (file) {
    try {
      const uploadResult = await uploadImageToCloudinary(file.buffer);
      imageUrl = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Image upload failed:", error.message);
        throw new Error("Image upload failed: " + error.message);
      }
      throw new Error("Image upload failed: Unknown error");
    }
  }

  const productData = { ...data, imageUrl };
  return await createProduct(productData);
};

export const getAllProductsService = async (filters: ProductFilter = {}) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const products = await getAllProducts(filters, skip, limit);

  const total = products.length;

  return {
    data: products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getProductByIdService = async (id: string) => {
  const product = await findProductById(id);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

export const updateProductService = async (
  id: string,
  data: Partial<Product>,
  file: Express.Multer.File | undefined
) => {
  console.log("sampe service");
  const existing = await findProductById(id);
  if (!existing) throw new Error("Product not found");

  let imageUrl: { url: string; publicId: string } | undefined = undefined;

  if (file) {
    try {
      const existingImageUrl = existing.imageUrl;

      if (
        existingImageUrl &&
        typeof existingImageUrl === "object" &&
        "publicId" in existingImageUrl &&
        typeof existingImageUrl.publicId === "string"
      ) {
        await deleteImageFromCloudinary(existingImageUrl.publicId);
      }

      const uploadResult = await uploadImageToCloudinary(file.buffer);
      imageUrl = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error(
        "Image upload failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  // Persiapkan data untuk update
  const updatedData: Partial<Product> = {
    ...data,
  };

  // Jika ada imageUrl baru, tambahkan ke updatedData
  if (imageUrl) {
    updatedData.imageUrl = imageUrl;
  }

  // Melakukan update produk di database
  const updated = await updateProduct(id, updatedData);

  return updated;
};

export const deleteProductService = async (id: string) => {
  const existing = await findProductById(id);
  if (!existing) {
    throw new Error("Product not found");
  }

  if (
    existing.imageUrl &&
    typeof existing.imageUrl === "object" &&
    "publicId" in existing.imageUrl
  ) {
    try {
      const { publicId } = existing.imageUrl as { publicId: string };
      await deleteImageFromCloudinary(publicId);
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }
  }

  return await deleteProduct(id);
};

export const getMetaService = async () => {
  let categories = getCachedData("categories");
  let types = getCachedData("types");
  let objectives = getCachedData("objectives");
  let colors = getCachedData("colors");

  if (!categories) {
    categories = await getAllCategories();
    setCachedData("categories", categories);
  }

  if (!types) {
    types = await getAllTypes();
    setCachedData("types", types);
  }

  if (!objectives) {
    objectives = await getAllObjectives();
    setCachedData("objectives", objectives);
  }

  if (!colors) {
    colors = await getAllColors();
    setCachedData("colors", colors);
  }

  return {
    categories,
    types,
    objectives,
    colors,
  };
};
