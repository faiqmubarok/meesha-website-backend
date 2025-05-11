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

export const createProductService = async (data: Product) => {
  const existing = await getAllProducts({ name: data.name });
  if (existing.length > 0) {
    throw new Error("Product with this name already exists");
  }

  let imageUrl = undefined;
  if (data.imageUrl) {
    try {
      const uploadResult = await uploadImageToCloudinary(data.imageUrl.url);

      imageUrl = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      if (error instanceof Error) {
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
  data: Partial<Product>
) => {
  const existing = await findProductById(id);
  if (!existing) throw new Error("Product not found");

  let imageUrl: Product["imageUrl"] = existing.imageUrl as Product["imageUrl"];

  if (data.imageUrl && data.imageUrl.url !== imageUrl?.url) {
    try {
      if (imageUrl?.publicId) {
        await deleteImageFromCloudinary(imageUrl.publicId);
      }
      const uploaded = await uploadImageToCloudinary(data.imageUrl.url);
      imageUrl = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    } catch (error: any) {
      throw new Error("Image upload failed: " + error.message);
    }
  }

  const updatePayload: Partial<Product> = {
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    size: data.size,
    variant: data.variant,
    imageUrl,
    category: data.category,
    type: data.type,
    objective: data.objective,
    color: data.color,
  };

  return await updateProduct(id, updatePayload);
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
