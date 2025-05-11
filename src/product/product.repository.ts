import { Product, ProductFilter } from "../types/product";
import prisma from "../lib/prisma";
import { Size } from "@prisma/client";

export const createProduct = async (data: Product) => {
  return await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      description: data.description,
      imageUrl: data.imageUrl,
      size: data.size as Size,
      variant: data.variant,
      category: {
        connect: { id: data.category.id },
      },
      type: {
        connect: { id: data.type.id },
      },
      objective: {
        connect: { id: data.objective.id },
      },
      color: {
        connect: { id: data.color.id },
      },
    },
  });
};

export const getAllProducts = async (
  filters: ProductFilter = {},
  skip = 0,
  take = 10
) => {
  const products = await prisma.product.findMany({
    where: {
      ...(filters.search && {
        name: { contains: filters.search, mode: "insensitive" },
      }),
      ...(filters.name && {
        name: { equals: filters.name },
      }),
      ...(filters.category && {
        category: { key: { in: filters.category } },
      }),
      ...(filters.type && {
        type: { key: { in: filters.type } },
      }),
      ...(filters.objective && {
        objective: { key: { in: filters.objective } },
      }),
      ...(filters.color && {
        color: { key: { in: filters.color } },
      }),
      ...(filters.size && {
        size: { in: filters.size },
      }),
      ...(filters.price && {
        price: {
          ...(filters.price.gte !== undefined && { gte: filters.price.gte }),
          ...(filters.price.lte !== undefined && { lte: filters.price.lte }),
        },
      }),
    },
    include: {
      category: {
        select: { key: true, name: true },
      },
      type: {
        select: { key: true, name: true },
      },
      objective: {
        select: { key: true, name: true },
      },
      color: {
        select: { key: true, name: true },
      },
    },
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
  });

  const transformedProducts = products.map(
    ({ categoryId, typeId, objectiveId, colorId, ...rest }) => rest
  );
  return transformedProducts;
};

export const findProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: { key: true, name: true },
      },
      type: {
        select: { key: true, name: true },
      },
      objective: {
        select: { key: true, name: true },
      },
      color: {
        select: { key: true, name: true },
      },
    },
  });

  if (!product) return null;

  // Destructure untuk menghapus ID foreign keys
  const { categoryId, typeId, objectiveId, colorId, ...cleanedProduct } =
    product;

  return cleanedProduct;
};

export const deleteProduct = async (id: string) => {
  return await prisma.product.delete({ where: { id } });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  return await prisma.product.update({
    where: { id },
    data: {
      ...data,
      size: data.size as Size | undefined,
      category: data.category?.id
        ? { connect: { id: data.category.id } }
        : undefined,
      type: data.type?.id ? { connect: { id: data.type.id } } : undefined,
      objective: data.objective?.id
        ? { connect: { id: data.objective.id } }
        : undefined,
      color: data.color?.id ? { connect: { id: data.color.id } } : undefined,
    },
  });
};

export const getAllCategories = () => prisma.category.findMany();
export const getAllTypes = () => prisma.type.findMany();
export const getAllObjectives = () => prisma.objective.findMany();
export const getAllColors = () => prisma.color.findMany();
