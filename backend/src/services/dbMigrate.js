import { supabase } from './supabaseClient.js';

export const runMigrations = async () => {
  try {
    console.log('🔄 Checking database schema...');
    
    // Check if critical tables exist
    const tables = ['users', 'transactions', 'savings_goals', 'investments', 'bill_reminders', 'budgets', 'loans', 'vehicles'];
    const missingTables = [];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code === '42P01') {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.warn(`⚠️  Missing database tables: ${missingTables.join(', ')}`);
      console.warn('⚠️  Please run backend/database/schema.sql in Supabase SQL Editor to create all tables');
      console.warn('⚠️  Navigate to: https://supabase.com/dashboard -> SQL Editor');
      return false;
    }

    console.log('✅ Database schema check passed');
    return true;
  } catch (error) {
    console.warn('⚠️  Schema check failed. Run backend/database/schema.sql in Supabase SQL editor.');
    return false;
  }
};
