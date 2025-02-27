/*
  # Create announcements and attachments tables

  1. New Tables
    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `created_at` (timestamp with time zone, default now())
      - `created_by` (uuid, references auth.users)
      - `is_pinned` (boolean, default false)
    
    - `announcement_attachments`
      - `id` (uuid, primary key)
      - `announcement_id` (uuid, references announcements)
      - `name` (text, not null)
      - `url` (text, not null)
      - `type` (text, not null)
      - `created_at` (timestamp with time zone, default now())
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read announcements and attachments
    - Add policies for admins to create, update, and delete announcements and attachments
*/

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_pinned boolean DEFAULT false
);

-- Create announcement_attachments table
CREATE TABLE IF NOT EXISTS announcement_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('document', 'image', 'video')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_attachments ENABLE ROW LEVEL SECURITY;

-- Policies for announcements
CREATE POLICY "Enable read access for all users on announcements"
  ON announcements FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins on announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (check_admin_status());

CREATE POLICY "Enable update for admins on announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (check_admin_status());

CREATE POLICY "Enable delete for admins on announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (check_admin_status());

-- Policies for announcement_attachments
CREATE POLICY "Enable read access for all users on announcement_attachments"
  ON announcement_attachments FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins on announcement_attachments"
  ON announcement_attachments FOR INSERT
  TO authenticated
  WITH CHECK (check_admin_status());

CREATE POLICY "Enable update for admins on announcement_attachments"
  ON announcement_attachments FOR UPDATE
  TO authenticated
  USING (check_admin_status());

CREATE POLICY "Enable delete for admins on announcement_attachments"
  ON announcement_attachments FOR DELETE
  TO authenticated
  USING (check_admin_status());

-- Create storage bucket for attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to read from the attachments bucket
CREATE POLICY "Allow public read access on attachments bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');

-- Policy to allow admins to insert into the attachments bucket
CREATE POLICY "Allow admin insert access on attachments bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments' AND
    check_admin_status()
  );

-- Policy to allow admins to update objects in the attachments bucket
CREATE POLICY "Allow admin update access on attachments bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'attachments' AND
    check_admin_status()
  );

-- Policy to allow admins to delete objects from the attachments bucket
CREATE POLICY "Allow admin delete access on attachments bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments' AND
    check_admin_status()
  );