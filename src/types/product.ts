import { Size } from "@prisma/client";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: {
    url: string;
    publicId: string;
  };
  stock: number;
  size?: string;
  variant?: string[];
  category: {
    id: string;
    key: string;
    name: string;
  };
  type: {
    id: string;
    key: string;
    name: string;
  };
  objective: {
    id: string;
    key: string;
    name: string;
  };
  color: {
    id: string;
    key: string;
    name: string;
  };
};

export type UpdateProductInput = {
  name: string;
  price: number;
  stock: number;
  description: string;
  size: "S" | "M" | "L" | "XL" | "XXL";
  variant: string[];
  categoryId: string;
  typeId: string;
  objectiveId: string;
  colorId: string;
};

export interface ProductFilter {
  search?: string;
  name?: string;
  category?: string[];
  type?: string[];
  objective?: string[];
  color?: string[];
  price?: {
    gte?: number;
    lte?: number;
  };
  size?: Size[];
  page?: number;
  limit?: number;
}
