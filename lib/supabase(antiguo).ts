
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gljdrdunulkjsvbdquzd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsamRyZHVudWxranN2YmRxdXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Mzc1MTcsImV4cCI6MjA4NDUxMzUxN30.okoJpGaZbsU6uOiLst86w5KBIk2cIntG3enkDCxRW0Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Schema expectation for the user (SQL to run in Supabase SQL Editor):
/*
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  full_name TEXT,
  email TEXT,
  dni TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  request_invoice BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(),
  items TEXT[],
  status TEXT DEFAULT 'En preparación',
  delivery_method TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Formulations table
CREATE TABLE formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT auth.uid(),
  patient_name TEXT,
  patient_dni TEXT,
  doctor_name TEXT,
  composition JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
*/
