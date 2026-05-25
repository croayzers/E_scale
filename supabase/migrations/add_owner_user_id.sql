-- Migración: añadir columna owner_user_id a organizations
-- Ejecutar en Supabase Dashboard → SQL Editor
--
-- Causa del error:
--   "column organizations_1.owner_user_id does not exist"
-- La tabla fue creada sin esta columna (schema.sql ya la define,
-- pero la tabla existente en Supabase no la tiene todavía).

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS owner_user_id uuid
  REFERENCES auth.users (id) ON DELETE SET NULL;

-- Índice para acelerar búsquedas por propietario
CREATE INDEX IF NOT EXISTS organizations_owner_user_id_idx
  ON public.organizations (owner_user_id);
