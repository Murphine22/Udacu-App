/*
  # Update announcements table structure

  1. New Fields
    - Add venue, event_date, sender_name, and priority fields to announcements table
  
  2. Changes
    - Modify existing announcements table to include new structured fields
    - Set default priority to 'medium'
*/

-- Add new fields to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS event_date date,
ADD COLUMN IF NOT EXISTS sender_name text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Update existing announcements to have medium priority if null
UPDATE announcements SET priority = 'medium' WHERE priority IS NULL;