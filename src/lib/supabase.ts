import { createClient } from '@supabase/supabase-js';
import { CUISINES } from '../data/mockData';
import { Restaurant, Cuisine } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = !supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('mock-tomattto');

export const supabase = !isPlaceholder && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to fetch restaurants from Supabase backend (Strict: No mock data fallback)
export async function getRestaurants(): Promise<Restaurant[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_cuisines (cuisines (name)),
          categories (*, menu_items (*))
        `);
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name || 'Restaurant',
          slug: row.slug || row.id,
          tagline: row.tagline || '',
          description: row.description || '',
          coverImage:
            row.coverImage ||
            row.cover_image ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
          rating: Number(row.rating) || 4.5,
          ratingCount: Number(row.ratingCount ?? row.rating_count) || 0,
          prepTimeMinutes: Number(row.prepTimeMinutes ?? row.avg_prep_time_minutes) || 25,
          costForTwo: Number(row.costForTwo ?? row.cost_for_two) || 400,
          isPureVeg: Boolean(row.isPureVeg ?? row.is_pure_veg),
          isOpen: Boolean(row.isOpen ?? row.is_open ?? true),
          address: row.address || row.address_text || 'Bengaluru',
          phone: row.phone || '',
          distanceKm: Number(row.distanceKm) || 3.0,
          cuisines: Array.isArray(row.cuisines)
            ? row.cuisines
            : Array.isArray(row.restaurant_cuisines)
            ? row.restaurant_cuisines.map((rc: any) => rc.cuisines?.name).filter(Boolean)
            : [],
          offerText: row.offerText || row.offer_text || undefined,
          categories: (row.categories || []).map((cat: any) => ({
            id: cat.id,
            restaurantId: cat.restaurant_id || row.id,
            name: cat.name,
            sortOrder: cat.sort_order ?? 0,
            items: (cat.menu_items || cat.items || []).map((item: any) => ({
              id: item.id,
              restaurantId: item.restaurant_id || row.id,
              categoryId: item.category_id || cat.id,
              name: item.name,
              description: item.description || '',
              price: Number(item.price) || 0,
              discountPrice: item.discount_price ? Number(item.discount_price) : undefined,
              dietary: item.dietary || (item.is_veg ? 'veg' : 'non_veg'),
              imageUrl: item.image_url || item.imageUrl || '',
              isBestseller: Boolean(item.is_bestseller),
              isInStock: item.is_in_stock !== false,
              variants: item.variants || [],
              addons: item.addons || []
            }))
          })),
          commissionRate: Number(row.commission_percentage ?? row.commissionRate) || 18,
          status: row.status || (row.is_open ? 'active' : 'suspended')
        })) as Restaurant[];
      }
    } catch {
      // Query failed or table empty
    }
  }
  return [];
}

export async function getCuisines(): Promise<Cuisine[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('cuisines').select('*');
      if (!error && data && data.length > 0) {
        return data as Cuisine[];
      }
    } catch {
      // Fallback
    }
  }
  return CUISINES;
}
