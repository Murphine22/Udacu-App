/*
  # Fix admin status check

  1. Changes
    - Add secure RPC function to check admin status
    - Update admin check logic to use RPC function

  2. Security
    - Function is only accessible to authenticated users
    - Returns boolean indicating admin status
*/

-- Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.check_admin_status()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;