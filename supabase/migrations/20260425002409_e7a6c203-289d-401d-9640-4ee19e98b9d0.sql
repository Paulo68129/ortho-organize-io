-- Atualizar função de novo usuário para incluir o segundo e-mail como staff
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

  IF lower(NEW.email) IN ('drarobertamachado.opne@gmail.com', 'hankspqd6812925@gmail.com') THEN
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
$function$;

-- Promover usuário existente para staff (e remover papel "user" se houver)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'staff'::app_role
FROM auth.users
WHERE lower(email) = 'hankspqd6812925@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.user_roles
WHERE role = 'user'
  AND user_id IN (
    SELECT id FROM auth.users WHERE lower(email) = 'hankspqd6812925@gmail.com'
  );