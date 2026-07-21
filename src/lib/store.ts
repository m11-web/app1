import { supabase } from './supabase';
import { Product, Order, AppBanner, Sale, SaleType } from './types';

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export function getCategories(products: Product[]): string[] {
  const cats = new Set(products.map((p) => p.category).filter(Boolean));
  return Array.from(cats);
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function placeOrder(order: Omit<Order, 'id' | 'created_at' | 'items'>, items: { product_id: string; product_name: string; quantity: number; unit_price: number; manufacturing_price: number }[]) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    manufacturing_price: item.manufacturing_price,
    order_id: orderData.id,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return orderData;
}

// ─── Banners ─────────────────────────────────────────────────────────────────

export async function getBanners(): Promise<AppBanner[]> {
  const { data, error } = await supabase
    .from('app_banners')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    // Table may not exist yet — return empty
    return [];
  }
  return data ?? [];
}

export async function getAllBanners(): Promise<AppBanner[]> {
  const { data, error } = await supabase
    .from('app_banners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function upsertBanner(banner: Partial<AppBanner>): Promise<void> {
  const { error } = await supabase.from('app_banners').upsert(banner);
  if (error) throw error;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('app_banners').delete().eq('id', id);
  if (error) throw error;
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export async function recordSale(sale: Omit<Sale, 'id' | 'sold_at'>): Promise<void> {
  const { error } = await supabase.from('sales').insert({
    ...sale,
    sold_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ─── Push Tokens ─────────────────────────────────────────────────────────────

export async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token, updated_at: new Date().toISOString() });
  if (error) console.warn('savePushToken error:', error.message);
}
