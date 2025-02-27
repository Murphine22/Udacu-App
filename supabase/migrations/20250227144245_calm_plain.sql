/*
  # Fix announcements table foreign key relationship

  1. Changes
    - Add a view to properly join announcements with auth.users
    - Fix the storage bucket policies for attachments
*/

-- Create a view to join announcements with auth.users
CREATE OR REPLACE VIEW public.announcements_with_users AS
SELECT 
  a.*,
  u.email as author_email
FROM 
  announcements a
LEFT JOIN 
  auth.users u ON a.created_by = u.id;

-- Make sure the storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on attachments bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin insert access on attachments bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update access on attachments bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete access on attachments bucket" ON storage.objects;

-- Create new policies with proper syntax
CREATE POLICY "Allow public read access on attachments bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');

CREATE POLICY "Allow admin insert access on attachments bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments' AND
    (SELECT check_admin_status())
  );

CREATE POLICY "Allow admin update access on attachments bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'attachments' AND
    (SELECT check_admin_status())
  );

CREATE POLICY "Allow admin delete access on attachments bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments' AND
    (SELECT check_admin_status())
  );