# 🚀 Upload Functionality - Fix & Test Guide

## 📋 Issue Summary

**Error:** `Upload failed: Bucket not found`

**Root Cause:** Supabase storage buckets were never created

**Impact:** Campaign creation fails when trying to upload pitch decks, logos, or other files

**Fix Time:** 5 minutes

---

## ✅ IMMEDIATE FIX (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **gnzcvhyxiatcjofywkdq**
3. Click: **SQL Editor** (left sidebar)

### Step 2: Run Storage Buckets SQL
1. Click: **New Query**
2. Open file: `nextjs_space/create-storage-buckets.sql`
3. Copy ALL contents (entire file)
4. Paste into SQL Editor
5. Click: **Run** (or press Ctrl+Enter)
6. Wait 5-10 seconds

### Step 3: Verify Buckets Created
1. Click: **Storage** in left sidebar
2. You should see 4 buckets:
   - ✅ company-logos (public)
   - ✅ pitch-decks (public)
   - ✅ documents (private)
   - ✅ videos (public)

### Step 4: Verify with Debug Script
```bash
cd C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space
node test-upload-debug.js
```

You should see:
```
✅ company-logos (public)
✅ pitch-decks (public)
✅ documents (private)
✅ videos (public)
```

---

## 🧪 TESTING UPLOAD FUNCTIONALITY

### Prerequisites
- ✅ Storage buckets created (see above)
- ✅ Dev server running: `npm run dev`
- ✅ User authenticated in browser

### Test 1: Manual Browser Test

#### Start Dev Server
```bash
cd C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space
npm run dev
```

#### Test Campaign Creation with Upload
1. Open: http://localhost:3000
2. Sign in with test account
3. Navigate to: Create Campaign page
4. Fill in campaign details:
   - **Company Name:** Test Company
   - **Industry:** Technology
   - **Funding Goal:** $100,000
   - **Description:** Test campaign description
5. **Upload Pitch Deck:**
   - Click "Upload Pitch Deck" button
   - Select any PDF file
   - Watch for progress indicator
   - Should show success message
6. **Upload Company Logo:**
   - Click "Upload Logo" button
   - Select any image file (PNG, JPG, WEBP, SVG)
   - Watch for preview
   - Should show uploaded logo
7. Click **Create Campaign**
8. Check browser console (F12) for errors
9. Check server terminal for upload logs

#### Expected Results
- ✅ File upload shows progress
- ✅ Upload completes successfully
- ✅ File URL is generated
- ✅ Campaign is created with file URLs
- ✅ No console errors
- ✅ No server errors

#### Common Issues
| Issue | Cause | Fix |
|-------|-------|-----|
| "Bucket not found" | Buckets not created | Run `create-storage-buckets.sql` |
| "Unauthorized" | Not signed in | Sign in first |
| "File too large" | File exceeds limit | Use smaller file |
| "Invalid file type" | Wrong file type | Use allowed types |

---

### Test 2: API Test with cURL

#### Get Session Cookie
1. Sign in at: http://localhost:3000/auth/signin
2. Open DevTools (F12) → Application → Cookies
3. Copy value of: `next-auth.session-token`

#### Test Upload API
```bash
# Create test file
echo "Test content" > test-upload.txt

# Test upload (replace YOUR_COOKIE with actual cookie)
curl -X POST http://localhost:3000/api/upload ^
  -H "Cookie: next-auth.session-token=YOUR_COOKIE" ^
  -F "file=@test-upload.txt" ^
  -F "bucket=documents"
```

#### Expected Response
```json
{
  "success": true,
  "url": "https://gnzcvhyxiatcjofywkdq.supabase.co/storage/v1/object/public/documents/...",
  "path": "user-id/timestamp-test-upload.txt"
}
```

#### Error Response Examples
```json
// Bucket not found
{ "error": "Upload failed: Bucket not found" }

// Not authenticated
{ "error": "Unauthorized" }

// Invalid file type
{ "error": "Invalid file type. Allowed: application/pdf, image/jpeg, image/png" }
```

---

### Test 3: Automated Test with Cookie from logs_attempts.txt

The cookie is already in your logs file. Let's use it:

```bash
cd C:\Users\edwar\Downloads\MVP\Demo_App_Development_Guide\ai_roi_dashboard\nextjs_space

# Add cookie to .env for testing
echo TEST_COOKIE="next-auth.csrf-token=a3629b38f86aaabe71ce515db6a2b531eaef4fdb03f88c1600a44678c0c9b3e0%%7Cc82ff6d1c12a71fe29208a408072d92beffdfd99e8b02a9bcea3ba95cc333592; next-auth.callback-url=http%%3A%%2F%%2Flocalhost%%3A3000%%2Fauth%%2Fsignin; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..5XOjQOFAo1QJbLK2.vqrewudMf4ufIMZyiWLPmsRuUWpld8n7AmJ0WlBmArs57wTntXVs00JBr-BighQpIneGBw9xvs1Xyg1xEZKXsrwSqxBDAun8nd1aqljpYow2rXzE0-4J3vy5L4yxLKqTliUvhmTP7BU9_spc-0GrtqGxx04qVJDcNpMLVqDWej8jpewOLVSQ26g3uxAJHNmsn73z7GBiCC7D3oxBphBeUNynxaiLsyobk16q_LZ-5QYujSltIGeHI0eb9stk_VJ-Ocw5SCDTYIEOGC6cDGmeeMHHcat8YYvesUME1jNG3PwD2XUa-q1me4DXaQEn.TAK3Fdnhgcz3YlWpa3gXQA" >> .env

# Note: Cookie may be expired, you'll need a fresh one from browser
```

---

## 📊 Storage Bucket Configuration

### Bucket Details

| Bucket | Purpose | Public | Size Limit | Allowed Types |
|--------|---------|--------|------------|---------------|
| `company-logos` | Startup logos | Yes | 5MB | JPG, PNG, WEBP, SVG |
| `pitch-decks` | Campaign PDFs | Yes | 50MB | PDF |
| `documents` | KYC documents | No | 20MB | PDF, JPG, PNG |
| `videos` | VSL videos | Yes | 500MB | MP4, WEBM |

### Security (RLS Policies)

**Public Buckets** (company-logos, pitch-decks, videos):
- ✅ Anyone can view files
- ✅ Authenticated users can upload
- ✅ Users can only delete their own files

**Private Buckets** (documents):
- ✅ Authenticated users can upload
- ✅ Users can only view/delete their own files
- ❌ Public access denied

---

## 🔍 DEBUGGING CHECKLIST

### When Upload Fails

#### 1. Check Buckets Exist
```bash
node test-upload-debug.js
```
Should show all 4 buckets as ✅

#### 2. Check Authentication
- Open DevTools → Application → Cookies
- Verify `next-auth.session-token` exists
- Try signing out and back in

#### 3. Check File Validation
- **Logo:** Max 5MB, must be image
- **Pitch Deck:** Max 50MB, must be PDF
- **Document:** Max 20MB, PDF/image only
- **Video:** Max 500MB, MP4/WEBM only

#### 4. Check Server Logs
```bash
# Look for errors in server terminal
Upload error: Error: Upload failed: Bucket not found
```

#### 5. Check Browser Console
```javascript
// Open DevTools (F12) → Console
// Look for errors like:
Failed to fetch
POST /api/upload 500 (Internal Server Error)
```

#### 6. Check Supabase Dashboard
1. Go to: Storage → Buckets
2. Click on a bucket
3. Check if files are being created
4. Check file permissions

---

## 🛠️ FIXING COMMON ISSUES

### Issue: "Bucket not found"
**Solution:** Run `create-storage-buckets.sql`

### Issue: "Unauthorized"
**Solution:** 
1. Clear browser cache
2. Sign out and sign in again
3. Check NextAuth configuration

### Issue: "Invalid file type"
**Solution:** Check file extension matches allowed types

### Issue: Upload succeeds but file not visible
**Solution:** 
1. Check bucket is public (for public files)
2. Verify RLS policies are correct
3. Check file URL in database

### Issue: Upload times out
**Solution:**
1. Check file size (may be too large)
2. Check network connection
3. Increase timeout in upload component

---

## 📝 TESTING CAMPAIGN CREATION (End-to-End)

### Complete Flow Test

1. **Start Fresh**
   ```bash
   # Clear browser data
   # Sign out and sign in
   ```

2. **Create Campaign**
   - Navigate to: Create Campaign
   - Fill all required fields
   - Upload pitch deck (PDF, < 50MB)
   - Upload company logo (PNG/JPG, < 5MB)
   - Click "Create Campaign"

3. **Verify in Database**
   ```bash
   # Check Supabase Table Editor
   # campaigns table should have new row
   # pitch_deck_url and logo_url should be populated
   ```

4. **Verify Files in Storage**
   - Go to: Storage → pitch-decks
   - Should see uploaded PDF
   - Go to: Storage → company-logos
   - Should see uploaded logo

5. **Verify Public Access**
   - Copy file URL from database
   - Open in new browser tab
   - Should display/download file

---

## 🎯 SUCCESS CRITERIA

### Upload Functionality Working When:
- ✅ All 4 buckets exist in Supabase
- ✅ RLS policies are active
- ✅ File upload completes without errors
- ✅ File URL is generated and saved
- ✅ Files are accessible at URL
- ✅ Campaign creation succeeds with uploads
- ✅ No console errors
- ✅ No server errors

---

## 📞 TROUBLESHOOTING SUPPORT

### Debug Script Outputs

**All Buckets Exist:**
```
✅ company-logos (public)
✅ pitch-decks (public)
✅ documents (private)
✅ videos (public)
```

**Missing Buckets:**
```
❌ company-logos - NOT FOUND
```
→ Run `create-storage-buckets.sql`

### Log Analysis

**Success:**
```
Upload successful: /api/upload 200 in 1234ms
```

**Failure:**
```
Upload error: Error: Upload failed: Bucket not found
POST /api/upload 500 in 2967ms
```

---

## 🚀 NEXT STEPS AFTER FIX

1. ✅ Verify all buckets created
2. ✅ Test upload with debug script
3. ✅ Test campaign creation in browser
4. ✅ Create 2-3 test campaigns with different files
5. ✅ Verify files are accessible
6. ✅ Test investor can view campaign files
7. ✅ Document any other issues found

---

## 📚 RELATED FILES

- **SQL Script:** `nextjs_space/create-storage-buckets.sql`
- **Debug Tool:** `nextjs_space/test-upload-debug.js`
- **Upload API:** `nextjs_space/app/api/upload/route.ts`
- **Supabase Config:** `nextjs_space/lib/supabase.ts`
- **Upload Logs:** `logs_attempts.txt`
- **Setup Guide:** `nextjs_space/SUPABASE_STORAGE_SETUP.md`

---

**Generated:** 2025-11-02  
**Status:** Ready to Fix  
**Estimated Fix Time:** 5 minutes  
**Estimated Test Time:** 15 minutes  

**Good luck! 🚀**
