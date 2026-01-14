import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

let supabase: SupabaseClient | null = null;

/**
 * Initializes the Supabase client.
 * Uses environment variables for URL and Anon Key.
 * 
 * @returns {SupabaseClient | null} - The initialized client or null if it fails.
 */
export const initSupabase = (): SupabaseClient | null => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        logger.error('Supabase URL or Anon Key missing in .env file');
        return null;
    }

    if (!supabase) {
        try {
            supabase = createClient(supabaseUrl, supabaseAnonKey);
            logger.info('Supabase client initialized.');
        } catch (error: any) {
            logger.error("Failed to initialize Supabase client:", error);
            return null;
        }
    }
    return supabase;
};

/**
 * Retrieves the initialized Supabase client instance.
 * Attempts to re-initialize if the client is not available.
 * 
 * @returns {SupabaseClient | null} - The Supabase client instance.
 */
export const getSupabase = (): SupabaseClient | null => {
    if (!supabase) {
        logger.warn('Supabase client requested before initialization or initialization failed.');
        return initSupabase();
    }
    return supabase;
};
