/*
  # Monthly Dues Schema

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)

    - `monthly_dues`
      - `id` (uuid, primary key)
      - `member_id` (uuid, references members)
      - `month` (integer, 1-12)
      - `year` (integer)
      - `amount` (integer, default 500)
      - `paid_at` (timestamp)
      - `recorded_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read all records
    - Add policies for admin users to create/update records
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create monthly_dues table
CREATE TABLE IF NOT EXISTS monthly_dues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  month integer CHECK (month BETWEEN 1 AND 12),
  year integer,
  amount integer DEFAULT 500,
  paid_at timestamptz DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id),
  UNIQUE(member_id, month, year)
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_dues ENABLE ROW LEVEL SECURITY;

-- Policies for members table
CREATE POLICY "Allow all users to read members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to create members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%admin%'
    )
  );

CREATE POLICY "Allow admins to update members"
  ON members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%admin%'
    )
  );

-- Policies for monthly_dues table
CREATE POLICY "Allow all users to read monthly_dues"
  ON monthly_dues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to create monthly_dues"
  ON monthly_dues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%admin%'
    )
  );

CREATE POLICY "Allow admins to update monthly_dues"
  ON monthly_dues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%admin%'
    )
  );

CREATE POLICY "Allow admins to delete monthly_dues"
  ON monthly_dues FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%admin%'
    )
  );