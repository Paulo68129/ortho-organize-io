
-- Função que valida o e-mail no momento do cadastro
CREATE OR REPLACE FUNCTION public.restrict_signup_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) NOT IN (
    'hankspqd6812925@gmail.com',
    'drarobertamachado.opne@gmail.com'
  ) THEN
    RAISE EXCEPTION 'E-mail não autorizado para cadastro.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

-- Remove trigger anterior caso exista
DROP TRIGGER IF EXISTS restrict_signup_emails_trigger ON auth.users;

-- Cria o trigger BEFORE INSERT em auth.users
CREATE TRIGGER restrict_signup_emails_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.restrict_signup_emails();
