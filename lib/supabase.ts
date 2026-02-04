import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gljdrdunulkjsvbdquzd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsamRyZHVudWxranN2YmRxdXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Mzc1MTcsImV4cCI6MjA4NDUxMzUxN30.okoJpGaZbsU6uOiLst86w5KBIk2cIntG3enkDCxRW0Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Esquema real de la base de datos (SQL para el editor de Supabase):
/*
-- Tabla de Perfiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  full_name TEXT,
  email TEXT,
  dni TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Citas (Calendario Negro/Gris)
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  servicio TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  nombre_paciente TEXT,
  telefono_paciente TEXT,
  estado TEXT DEFAULT 'Confirmada',
  creado_el TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT cita_unica UNIQUE (fecha, hora)
);

-- Tabla de Pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  items TEXT[],
  status TEXT DEFAULT 'En preparación',
  metodo_entrega TEXT,
  metodo_pago TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de Fórmulas Magistrales
CREATE TABLE formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  nombre_paciente TEXT,
  dni_paciente TEXT,
  nombre_medico TEXT,
  composicion JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
*/