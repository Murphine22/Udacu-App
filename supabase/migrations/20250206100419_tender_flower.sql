/*
  # Update monthly dues table policies

  1. Changes
    - Drop existing policies for monthly_dues table
    - Create new policies using check_admin_status() function
    - Enable public read access
    - Restrict write operations to admins only

  2. Security
    - Allow anyone to read monthly dues records
    - Only admins can create, update, or delete dues records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all users to read monthly_dues" ON monthly_dues;
DROP POLICY IF EXISTS "Allow admins to create monthly_dues" ON monthly_dues;
DROP POLICY IF EXISTS "Allow admins to update monthly_dues" ON monthly_dues;
DROP POLICY IF EXISTS "Allow admins to delete monthly_dues" ON monthly_dues;

-- Create new policies with proper security
CREATE POLICY "Enable read access for all"
  ON monthly_dues FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins"
  ON monthly_dues FOR INSERT
  TO authenticated
  WITH CHECK (
    check_admin_status()
  );

CREATE POLICY "Enable update for admins"
  ON monthly_dues FOR UPDATE
  TO authenticated
  USING (
    check_admin_status()
  );

CREATE POLICY "Enable delete for admins"
  ON monthly_dues FOR DELETE
  TO authenticated
  USING (
    check_admin_status()
  );

-- Ensure RLS is enabled
ALTER TABLE monthly_dues ENABLE ROW LEVEL SECURITY;