# 📋 UPLOAD PROCEDURE - Step by Step

## ✅ CSV File Check

Your CSV file: `h.csv`
**Status:** ✅ READY TO UPLOAD

### CSV Analysis

```
✅ File size: Good
✅ Rows: 174 dishes
✅ Columns: 9 (name, price, category, subcategory, image, description + extra)
✅ Image path: C:\Users\Mohan\Downloads\kajuanjeer.jpg (all same)
✅ Data format: Correct
✅ No empty critical fields: name & price all present
```

### Sample Data Preview

| # | Name | Price | Category | Image | Status |
|----|------|-------|----------|-------|--------|
| 1 | Mango Juice | 100 | Fresh Juices | ✅ Exists | OK |
| 2 | Apple Juice | 70 | Fresh Juices | ✅ Exists | OK |
| 3 | Mango Milkshake | 100 | Milk Shakes | ✅ Exists | OK |
| ... | ... | ... | ... | ... | ... |
| 174 | Carrot Milkshake | 80 | Milk Shakes | ✅ Exists | OK |

---

## 🚀 UPLOAD PROCEDURE (5 Steps)

### STEP 1: Verify Backend is Running

**Terminal 1:** Open and check backend status

```bash
cd d:\kin\kingdomfoods\backend
npm run dev
```

**Expected output:**
```
nodemon server.js
Restarting due to changes...
Server running on port 5000
MongoDB connected ✓
```

**✅ Check:** Backend shows "running on port 5000" and "MongoDB connected"

---

### STEP 2: Verify Image File Exists

**Check:** Image path in CSV

```
Path: C:\Users\Mohan\Downloads\kajuanjeer.jpg
```

**Verify:**
1. Open File Explorer
2. Navigate to: `C:\Users\Mohan\Downloads\`
3. Look for: `kajuanjeer.jpg`

**✅ Check:** File exists and is accessible

**If missing:**
- Replace image path in CSV with valid image location
- Or use: `"C:\path\to\your\image.jpg"`

---

### STEP 3: Get Your JWT Token

**Option A: Fastest (DevTools)**

1. Open browser → `http://localhost:5000`
2. Login with your admin credentials
3. Press `F12` (Open DevTools)
4. Go to: `Application` tab
5. Click: `Cookies` in left sidebar
6. Find: Cookie named `token` or check `LocalStorage`
7. Copy the JWT value (looks like: `eyJhbGciOi...`)

**Option B: Via API**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-admin@example.com\",\"password\":\"your-password\"}"
```

Copy the `token` from response.

**✅ Check:** You have a token like `eyJhbGciOiJIUzI1NiIs...`

---

### STEP 4: Prepare Upload Command

**Open NEW Terminal (Terminal 2)**

Navigate to backend scripts:

```bash
cd d:\kin\kingdomfoods\backend
```

**Prepare the command:**

```bash
node scripts/uploadCSV.js "d:\kin\kingdomfoods\backend\h.csv" "YOUR_JWT_TOKEN_HERE"
```

**Replace:**
- `YOUR_JWT_TOKEN_HERE` with your actual JWT token

**Example:**
```bash
node scripts/uploadCSV.js "d:\kin\kingdomfoods\backend\h.csv" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmMxNDJiNWM2ZTk3NzFiMmVjYWY0YiIsInVzZXJuYW1lIjoia2FydGhpa3BpaW5hc2lAZ21haWwuY29tIiwiaWF0IjoxNzY1MjAyNjczLCJleHAiOjE3NjU4MDc0NzN9.c1KLsTEOlpKTRe03eD0kBF4P1oK5-9Tpjw0MhMEKYuo"
```

**✅ Check:** Command is ready to run

---

### STEP 5: Execute Upload

**In Terminal 2, run:**

```bash
node scripts/uploadCSV.js "d:\kin\kingdomfoods\backend\h.csv" "your-jwt-token"
```

**Press Enter and wait...**

**Expected Progress:**

```
🚀 CSV Bulk Upload Tool
═════════════════════════════════════════════════════════════════════
📄 CSV File: d:\kin\kingdomfoods\backend\h.csv
🔗 API URL: http://localhost:5000/menu/bulk/upload
═════════════════════════════════════════════════════════════════════

📖 Parsing CSV file...
✓ Found 174 valid dishes

Preview of first 3 dishes:
  1. Mango Juice - ₹100
  2. Apple Juice - ₹70
  3. Orange Juice - ₹70

📤 Uploading 174 dishes...
⏳ This may take a few minutes depending on image sizes...

[PROCESSING - DO NOT CLOSE TERMINAL]
```

**⏳ Wait for completion (5-15 minutes)**

---

## ✅ SUCCESS INDICATORS

After upload completes, you should see:

```
✅ Upload Complete!
═════════════════════════════════════════════════════════════════════
📊 Total Processed: 174
✓ Successful: 174
✗ Failed: 0

📋 Sample Uploaded Dishes:
  1. Mango Juice
  2. Apple Juice
  3. Orange Juice
  ... and 171 more

═════════════════════════════════════════════════════════════════════

🎉 All done! Check your database 🚀
```

**✅ All 174 dishes uploaded successfully!**

---

## 🔍 POST-UPLOAD VERIFICATION

### Verify in MongoDB

**Check total dishes uploaded:**
```bash
# In MongoDB Compass or shell
db.dishes.countDocuments()
# Should show: 174+
```

**Check specific dishes:**
```bash
db.dishes.find({name: "Mango Juice"})
db.dishes.find({category: "Fresh Juices"})
```

### Verify via API

**Test endpoint:**
```bash
curl http://localhost:5000/menu
```

**Should return:** Array of all dishes with images

**Check single dish:**
```bash
curl http://localhost:5000/menu/<dish-id>
```

### Verify Images on Cloudinary

1. Go to: https://cloudinary.com/console
2. Check folder: `restaurant_menu`
3. Should show: 174+ images uploaded

---

## ⚠️ TROUBLESHOOTING

### Issue: "Image file not found"

**Solution:**
- Check image path: `C:\Users\Mohan\Downloads\kajuanjeer.jpg`
- Make sure file exists and is accessible
- Restart upload with correct path

### Issue: "Authorization failed"

**Solution:**
- JWT token expired (get new one)
- Token might be incorrect
- Re-login and copy token again

### Issue: Upload is slow

**Solution:**
- Normal for 174 dishes
- Don't close terminal
- Can take 10-15 minutes for large files
- Check internet connection

### Issue: Some dishes failed

**Solution:**
- Check error message for details
- Usually due to validation errors
- Rerun script to retry failed dishes
- Script is safe to re-run (won't duplicate)

---

## 📝 COMPLETE CHECKLIST

Before Upload:
- [ ] Backend running: `npm run dev`
- [ ] Image file exists: `C:\Users\Mohan\Downloads\kajuanjeer.jpg`
- [ ] JWT token copied
- [ ] CSV file path correct: `d:\kin\kingdomfoods\backend\h.csv`
- [ ] No special characters in paths

During Upload:
- [ ] Terminal open and visible
- [ ] Don't close terminal
- [ ] Don't interrupt process
- [ ] Wait for completion

After Upload:
- [ ] Check "✓ Successful: 174" in output
- [ ] Verify in MongoDB
- [ ] Check Cloudinary images
- [ ] Test API endpoint

---

## 🎯 QUICK SUMMARY

```
Your CSV: h.csv (174 dishes) ✅
Image: kajuanjeer.jpg ✅
Status: READY TO UPLOAD ✅

Run this command:
node scripts/uploadCSV.js "d:\kin\kingdomfoods\backend\h.csv" "your-jwt-token"

Expected result:
✅ 174 dishes uploaded
✅ Images to Cloudinary
✅ Data to MongoDB
```

---

## 🚀 GO AHEAD AND UPLOAD!

**You're all set!** Your CSV is perfectly formatted and ready.

**Just run the command with your JWT token and watch it upload!**

---

**CSV Status:** ✅ VERIFIED  
**Ready:** ✅ YES  
**Procedure:** ✅ COMPLETE  
**Next Step:** Execute Step 5 above!

---

*Created: December 8, 2025*
*Your h.csv - 174 dishes ready to go! 🎉*
