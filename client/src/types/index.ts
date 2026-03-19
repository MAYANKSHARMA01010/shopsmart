// TypeScript interfaces shared across the frontend

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
}

export interface HealthStatus {
  status: string;
  message: string;
  timestamp: string;
  database: string;
}

export interface ApiError {
  error: string;
}
