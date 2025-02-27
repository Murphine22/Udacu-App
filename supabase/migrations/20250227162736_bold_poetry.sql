/*
  # Add admin user

  1. New Admin User
    - Grant admin privileges to jummaiwaziri74@gmail.com
  
  2. Changes
    - Set is_admin flag to true for the specified user
*/

-- Set the specified user as admin
UPDATE auth.users 
SET is_admin = true 
WHERE email = 'jummaiwaziri74@gmail.com';