// server/config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabase;

const initSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Supabase URL or Anon Key missing in .env file');
    return null; // Return null if initialization fails
  }

  if (!supabase) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      logger.info('Supabase client initialized.');
    } catch (error) {
      logger.error("Failed to initialize Supabase client:", error);
      return null;
    }
  }
  return supabase;
};

// Function to get the initialized client instance
const getSupabase = () => {
  if (!supabase) {
    logger.warn('Supabase client requested before initialization or initialization failed.');
    // Attempt to initialize again or handle error as needed
    return initSupabase();
  }
  return supabase;
}

module.exports = { initSupabase, getSupabase };