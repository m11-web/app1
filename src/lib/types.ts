// Type definitions for Rena Henna mobile app
// Mirrors the web app types exactly

export type Role = 'admin' | 'employee' | 'customer';
export type SaleType = 'retail' | 'wholesale';
export type ShippingType = 'Standard' | 'Fast';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  video_url?: string;
  images?: string[];
  manufacturing_price: number;
  retail_price: number;
  wholesale_price: number;
  discount_percent: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  profit: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  manufacturing_price: number;
  profit: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  whatsapp_number: string;
  address: string;
  payment_method: 'cod' | 'bank';
  shipping_type: ShippingType;
  shipping_fee: number;
  subtotal: number;
  total: number;
  items: OrderItem[];
  status: OrderStatus;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  manufacturing_price: number;
  profit: number;
  sale_type: SaleType;
  sold_at: string;
  sold_by: string | null;
  order_id?: string | null;
}

export interface AppBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

// ========== Price Helpers ==========

export function isFriday(): boolean {
  return new Date().getDay() === 5;
}

export function getDiscountedPrice(product: Product): number {
  if (product.discount_percent <= 0) return product.retail_price;
  const discount = product.retail_price * (product.discount_percent / 100);
  return Math.round((product.retail_price - discount) * 100) / 100;
}

export function getFridayPrice(product: Product): number {
  const base = getDiscountedPrice(product);
  return Math.max(base - 10, 0);
}

export function getCurrentPrice(product: Product): number {
  return isFriday() ? getFridayPrice(product) : getDiscountedPrice(product);
}

export function getProductProfit(product: Product): number {
  const finalPrice = getCurrentPrice(product);
  return Math.round((finalPrice - product.manufacturing_price) * 100) / 100;
}
