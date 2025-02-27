/*
  # Fix admin user access

  1. Changes
    - Ensure the admin user exists and has proper permissions
    - Update the admin status for the specified user
*/

-- First check if the user exists
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'jummaiwaziri74@gmail.com'
  ) INTO user_exists;

  -- If the user doesn't exist, we'll create it
  IF NOT user_exists THEN
    -- Insert the user with a secure password
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_admin
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'jummaiwaziri74@gmail.com',
      -- This is a placeholder. In production, you would use a proper password hash
      crypt('07063468177', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      true
    );
  ELSE
    -- If the user exists, ensure they have admin privileges
    UPDATE auth.users 
    SET is_admin = true 
    WHERE email = 'jummaiwaziri74@gmail.com';
  END IF;
END $$;