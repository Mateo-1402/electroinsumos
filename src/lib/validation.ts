import { z } from "zod";

export const DEFAULT_CATEGORIES = [
  "Condensadores",
  "Alambres",
  "Aislantes",
  "Cables",
  "Rodamientos",
  "Sellos",
  "Ventiladores",
  "Químicos",
  "Repuestos",
] as const;

export const productSchema = z.object({
  code: z.string().trim().min(1, "Código requerido").max(50, "Código muy largo"),
  name: z.string().trim().min(1, "Nombre requerido").max(200, "Nombre muy largo"),
  category: z.string().trim().min(1, "Categoría requerida").max(50, "Categoría muy larga"),
  specifications: z.string().max(500, "Especificaciones muy largas").nullable().optional(),
  price: z.number().min(0, "El precio no puede ser negativo").max(999999, "Precio excede el máximo"),
  unit: z.string().max(50, "Unidad muy larga").nullable().optional(),
  stock: z.number().int("Stock debe ser entero").min(0, "Stock no puede ser negativo").max(999999, "Stock excede el máximo"),
  image_url: z.string().url("URL de imagen inválida").max(500).nullable().optional(),
});

export const orderItemSchema = z.object({
  id: z.string().uuid("ID de producto inválido"),
  name: z.string().max(200, "Nombre muy largo"),
  specifications: z.string().max(500).nullable().optional(),
  quantity: z.number().int().min(1, "Cantidad mínima es 1").max(1000, "Cantidad excede el máximo"),
  price: z.number().min(0, "Precio no puede ser negativo"),
});

export const orderSchema = z.object({
  customer_name: z.string().max(200, "Nombre muy largo").nullable().optional(),
  total_price: z.number().min(0, "Total no puede ser negativo").max(999999, "Total excede el máximo"),
  status: z.enum(["pending", "completed", "cancelled"]),
  items: z.array(orderItemSchema).min(1, "Debe tener al menos un producto"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type OrderData = z.infer<typeof orderSchema>;
