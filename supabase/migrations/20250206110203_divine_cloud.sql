/*
  # Add Financial Management Tables

  1. New Tables
    - `contributions`
      - Track member contributions with descriptions
      - Fields: id, member_id, amount, description, created_at, created_by
    - `donations`
      - Track member donations
      - Fields: id, member_id, amount, created_at, created_by
    - `expenses`
      - Track departmental expenses
      - Fields: id, amount, description, created_at, created_by

  2. Security
    - Enable RLS on all new tables
    - Add policies for read access and admin management
*/

-- Create contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount integer NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies for contributions
CREATE POLICY "Enable read access for all users on contributions"
  ON contributions FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins on contributions"
  ON contributions FOR INSERT
  TO authenticated
  WITH CHECK (check_admin_status());

CREATE POLICY "Enable update for admins on contributions"
  ON contributions FOR UPDATE
  TO authenticated
  USING (check_admin_status());

CREATE POLICY "Enable delete for admins on contributions"
  ON contributions FOR DELETE
  TO authenticated
  USING (check_admin_status());

-- Policies for donations
CREATE POLICY "Enable read access for all users on donations"
  ON donations FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins on donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (check_admin_status());

CREATE POLICY "Enable update for admins on donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (check_admin_status());

CREATE POLICY "Enable delete for admins on donations"
  ON donations FOR DELETE
  TO authenticated
  USING (check_admin_status());

-- Policies for expenses
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