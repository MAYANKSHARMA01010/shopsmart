import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).transform((val) => Number.parseFloat(val as string)).refine((val) => !isNaN(val) && val >= 0, "Price must be a positive number"),
  stock: z.union([z.number(), z.string()]).optional().transform((val) => val === undefined ? 0 : Number.parseInt(val as string, 10)).refine((val) => !isNaN(val) && val >= 0, "Stock must be a non-negative integer"),
  category: z.string().optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
});

export type ProductFormValues = z.input<typeof productSchema>;
export type ProductData = z.output<typeof productSchema>;

export interface Product extends ProductData {
  id: number;
  createdAt: string;
  updatedAt: string;
}
