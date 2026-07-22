export type UserRole = "student" | "admin";

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  password: string;
  imageCarteScolaire: string;
}

export type PublicUser = Omit<User, "password">;


export interface Category {
  id: number;
  name: string;
  slug: string; // pour des URLs propres : /products?category=electronique
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  sellerId: number;
  categoryId: number;
  isSold: boolean;
  createdAt: Date;
}

export interface Message {
  id: number;
  content: string;
  timestamp: Date;
  senderId: number;
  receiverId: number;
  isRead: boolean;
}