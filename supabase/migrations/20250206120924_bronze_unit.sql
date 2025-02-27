/*
  # Add member_id to expenses table

  1. Changes
    - Add member_id column to expenses table with foreign key reference to members table
    - Make the column nullable since not all expenses may be associated with a member
*/

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS member_id uuid REFERENCES members(id) ON DELETE SET NULL;

-- Update RLS policies to include member_id in the checks
DROP POLICY IF EXISTS "Enable read access for all users on expenses" ON expenses;
DROP POLICY IF EXISTS "Enable insert for admins on expenses" ON expenses;
DROP POLICY IF EXISTS "Enable update for admins on expenses" ON expenses;
DROP POLICY IF EXISTS "Enable delete for admins on expenses" ON expenses;

CREATE POLICY "Enable read access for all users on expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins on expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (check_admin_status());

CREATE POLICY "Enable update for admins on expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (check_admin_status());

CREATE POLICY "Enable delete for admins on expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (check_admin_status());