#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { loadBackendEnv } from '../src/services/env.js';

loadBackendEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMissingTables() {
  console.log('🔄 Creating missing database tables...');

  const tables = [
    {
      name: 'savings_goals',
      sql: `
        CREATE TABLE IF NOT EXISTS savings_goals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          target_amount DECIMAL(12, 2) NOT NULL,
          saved_amount DECIMAL(12, 2) DEFAULT 0,
          monthly_contribution DECIMAL(12, 2),
          target_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
      `
    },
    {
      name: 'investments',
      sql: `
        CREATE TABLE IF NOT EXISTS investments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          investment_type VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          invested_amount DECIMAL(12, 2) NOT NULL,
          current_value DECIMAL(12, 2) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
      `
    },
    {
      name: 'bill_reminders',
      sql: `
        CREATE TABLE IF NOT EXISTS bill_reminders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          bill_name VARCHAR(255) NOT NULL,
          amount DECIMAL(12, 2) NOT NULL,
          due_date DATE NOT NULL,
          status VARCHAR(50) DEFAULT 'scheduled',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_bill_reminders_user_id ON bill_reminders(user_id);
        CREATE INDEX IF NOT EXISTS idx_bill_reminders_due_date ON bill_reminders(due_date);
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.name}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      
      if (error) {
        console.warn(`⚠️  Could not create ${table.name} via RPC: ${error.message}`);
        console.log(`   Please manually execute SQL for ${table.name} in Supabase SQL Editor`);
      } else {
        console.log(`✅ Created table: ${table.name}`);
      }
    } catch (err) {
      console.warn(`⚠️  Error creating ${table.name}: ${err.message}`);
    }
  }

  console.log('');
  console.log('========================================');
  console.log('If any tables failed to create, please run:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Execute the SQL from backend/database/schema.sql');
  console.log('========================================');
}

createMissingTables();
