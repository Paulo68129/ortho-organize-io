
-- Drop existing staff-only policies and create public policies
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['anamneses','consultas','dentistas','evolucoes_clinicas','financeiro','horarios','pacientes','prescricoes','procedimentos','procedimentos_realizados'];
  pol RECORD;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;
    EXECUTE format('CREATE POLICY "Public full access" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
