@echo off
echo.
echo ========================================
echo    UPLOAD STATUS CHECKER
echo ========================================
echo.
echo Checking Supabase storage buckets...
echo.

cd nextjs_space
node test-upload-debug.js

echo.
echo ========================================
echo.
echo If you see "NOT FOUND" errors above:
echo   1. Open Supabase Dashboard
echo   2. Run: create-storage-buckets.sql
echo   3. Run this script again
echo.
echo For detailed instructions, see:
echo   UPLOAD_FIX_AND_TEST_GUIDE.md
echo.
pause
