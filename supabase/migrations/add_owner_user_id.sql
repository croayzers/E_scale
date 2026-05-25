-- Migración: añadir columna owner_user_id a organizations
-- Ejecutar en Supabase Dashboard → SQL Editor
--
-- Causa del error:
--   "column organizations_1.owner_user_id does not exist"
-- La tabla fue creada sin esta columna (schema.sql ya la define,
-- pero la tabla existente en Supabase no la tiene todavía).

-- Columnas faltantes en organizations (schema aplicado parcialmente)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS owner_user_id uuid
    REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS phone   text,
  ADD COLUMN IF NOT EXISTS cif     text,
  ADD COLUMN IF NOT EXISTS country text;

-- RLS en tablas que quedaron sin proteger
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles        ENABLE ROW LEVEL SECURITY;

-- Índice para acelerar búsquedas por propietario
CREATE INDEX IF NOT EXISTS organizations_owner_user_id_idx
  ON public.organizations (owner_user_id);
