
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('staff', 'user');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Trigger function: auto-create profile + assign staff role to authorized email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;

  IF lower(NEW.email) = 'drarobertamachado.opne@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'staff')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill: create profiles + assign staff role for existing authorized user(s)
INSERT INTO public.profiles (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'staff'::public.app_role
FROM auth.users
WHERE lower(email) = 'drarobertamachado.opne@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::public.app_role
FROM auth.users
WHERE lower(email) <> 'drarobertamachado.opne@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. RLS policies for profiles & user_roles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Staff view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Staff view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'staff'));

-- 8. Replace existing permissive policies on all data tables with staff-only
DROP POLICY IF EXISTS "Staff can manage anamneses" ON public.anamneses;
CREATE POLICY "Only staff can manage anamneses" ON public.anamneses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage consultas" ON public.consultas;
CREATE POLICY "Only staff can manage consultas" ON public.consultas
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage dentistas" ON public.dentistas;
CREATE POLICY "Only staff can manage dentistas" ON public.dentistas
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage evolucoes" ON public.evolucoes_clinicas;
CREATE POLICY "Only staff can manage evolucoes" ON public.evolucoes_clinicas
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage financeiro" ON public.financeiro;
CREATE POLICY "Only staff can manage financeiro" ON public.financeiro
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage horarios" ON public.horarios;
CREATE POLICY "Only staff can manage horarios" ON public.horarios
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage pacientes" ON public.pacientes;
CREATE POLICY "Only staff can manage pacientes" ON public.pacientes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage prescricoes" ON public.prescricoes;
CREATE POLICY "Only staff can manage prescricoes" ON public.prescricoes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage procedimentos" ON public.procedimentos;
CREATE POLICY "Only staff can manage procedimentos" ON public.procedimentos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Staff can manage procedimentos_realizados" ON public.procedimentos_realizados;
CREATE POLICY "Only staff can manage procedimentos_realizados" ON public.procedimentos_realizados
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

-- 9. Trigger to keep profiles.updated_at fresh
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
