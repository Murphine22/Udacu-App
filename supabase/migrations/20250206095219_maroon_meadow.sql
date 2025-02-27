/*
  # Fix RLS policies for members table

  1. Changes
    - Add proper RLS policies for members table
    - Ensure authenticated users can read members
    - Ensure admins can manage members

  2. Security
    - Enable RLS on members table
    - Add policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow all users to read members" ON members;
DROP POLICY IF EXISTS "Allow admins to create members" ON members;
DROP POLICY IF EXISTS "Allow admins to update members" ON members;

-- Create new policies with proper security
CREATE POLICY "Anyone can read members"
  ON members FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );

CREATE POLICY "Admins can update members"
  ON members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.is_admin = true
    )
  );