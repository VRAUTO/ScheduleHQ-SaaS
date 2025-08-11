@echo off
echo.
echo ===========================================
echo  INVITATION SYSTEM UPDATE
echo ===========================================
echo.
echo This script will update your invitation system to:
echo - Add user_id column to invitations table
echo - Update create_invitation function to handle user lookup
echo - Update accept_invitation function for better user linking
echo.
echo Please make sure you have:
echo 1. Access to your Supabase SQL Editor
echo 2. Backup of your database (recommended)
echo.
pause

echo.
echo Instructions:
echo.
echo 1. Go to your Supabase project dashboard
echo 2. Navigate to SQL Editor
echo 3. Copy and paste the contents of "add_user_id_to_invitations.sql"
echo 4. Run the SQL script
echo.
echo The file contains:
echo - ALTER TABLE to add user_id column
echo - Updated create_invitation function
echo - Updated accept_invitation function
echo.
echo File location: %cd%\add_user_id_to_invitations.sql
echo.
pause

echo.
echo After running the SQL script, your invitation system will:
echo.
echo ✅ Check if users exist when creating invitations
echo ✅ Store user_id when user already exists
echo ✅ Link user_id when new users accept invitations
echo ✅ Prevent duplicate invitations
echo ✅ Validate email matching during acceptance
echo.
echo Press any key to open the SQL file...
pause > nul

start notepad.exe "%cd%\add_user_id_to_invitations.sql"

echo.
echo SQL file opened in notepad. Copy the contents to Supabase SQL Editor.
echo.
pause
