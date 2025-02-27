/*
  # Add admin role management

  1. Changes
    - Add is_admin column to auth.users
    - Update RLS policies to check is_admin flag
    - Set initial admin user

  2. Security
    - Update existing RLS policies to use is_admin column
    - Maintain existing security model with enhanced role management
*/

-- Add is_admin column to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Set the specified user as admin
UPDATE auth.users 
SET is_admin = true 
WHERE email = 'elishaejimofor@gmail.com';

-- Update members table policies
DROP POLICY IF EXISTS "Allow admins to create members" ON members;
DROP POLICY IF EXISTS "Allow admins to update members" ON members;

CREATE POLICY "Allow admins to create members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );

CREATE POLICY "Allow admins to update members"
  ON members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );

-- Update monthly_dues table policies
DROP POLICY IF EXISTS "Allow admins to create monthly_dues" ON monthly_dues;
DROP POLICY IF EXISTS "Allow admins to update monthly_dues" ON monthly_dues;
DROP POLICY IF EXISTS "Allow admins to delete monthly_dues" ON monthly_dues;

CREATE POLICY "Allow admins to create monthly_dues"
  ON monthly_dues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );

CREATE POLICY "Allow admins to update monthly_dues"
  ON monthly_dues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );

CREATE POLICY "Allow admins to delete monthly_dues"
  ON monthly_dues FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );