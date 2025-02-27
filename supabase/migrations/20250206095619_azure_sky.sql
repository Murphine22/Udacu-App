/*
  # Fix members table access policies

  1. Changes
    - Update RLS policies for members table
    - Enable public read access without authentication
    - Maintain admin-only write access
    - Fix permission denied errors

  2. Security
    - Allow public read access without authentication requirement
    - Maintain strict admin-only write operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read members" ON members;
DROP POLICY IF EXISTS "Admins can insert members" ON members;
DROP POLICY IF EXISTS "Admins can update members" ON members;
DROP POLICY IF EXISTS "Admins can delete members" ON members;

-- Create new policies with proper security
CREATE POLICY "Enable read access for all"
  ON members FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    check_admin_status()
  );

CREATE POLICY "Enable update for admins"
  ON members FOR UPDATE
  TO authenticated
  USING (
    check_admin_status()
  );

CREATE POLICY "Enable delete for admins"
  ON members FOR DELETE
  TO authenticated
  USING (
    check_admin_status()
  );

-- Ensure RLS is enabled
ALTER TABLE members ENABLE ROW LEVEL SECURITY;