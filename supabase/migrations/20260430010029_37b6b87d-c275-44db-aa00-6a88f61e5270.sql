-- Remove o trigger e função que bloqueavam signup por e-mail
DROP TRIGGER IF EXISTS restrict_signup_emails_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.restrict_signup_emails();

-- Atualiza handle_new_user para conceder staff a todos os novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;