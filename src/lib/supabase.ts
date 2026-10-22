import { createClient } from '@supabase/supabase-js';
import { RESTAURANTS, CUISINES } from '../data/mockData';
import { Restaurant, Cuisine } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = !supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('mock-tomattto');

export const supabase = !isPlaceholder && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to fetch restaurants with automatic Supabase or mock fallback
export async function getRestaurants(): Promise<Restaurant[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          categories (*, menu_items (*))
        `);
      if (!error && data && data.length > 0) {
        return data as unknown as Restaurant[];
      }
    } catch {
      // Fallback to local high-fidelity data
    }
  }
  return RESTAURANTS;
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
