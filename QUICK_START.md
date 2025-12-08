# ⚡ QUICK START - 5 Minutes to Upload 100+ Dishes

## Step 1: Install (1 minute)
```bash
cd d:\kin\kingdomfoods\backend
npm install axios csv-parse
```

## Step 2: Start Backend (1 minute)
```bash
npm run dev
```
Keep this terminal open.

## Step 3: Get Your JWT Token (1 minute)

### Option A - Using Browser DevTools (FASTEST)
1. Go to http://localhost:5000 (or your frontend)
2. Login as admin
3. Open DevTools: Press `F12`
4. Go to: `Application` → `Cookies`
5. Find cookie named `token` or check `localStorage` 
6. Copy the JWT token value

### Option B - Using cURL
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"your-password\"}"
```
Copy the `token` value from response.

## Step 4: Upload Your CSV (2 minutes)

Open a NEW terminal in `d:\kin\kingdomfoods\backend` and run:

```bash
node scripts/uploadCSV.js "d:\kin\kkk.csv.csv" "your-jwt-token-here"
```

**Replace:**
- `"d:\kin\kkk.csv.csv"` - Path to your CSV file
- `"your-jwt-token-here"` - Paste your actual JWT token

**Full Example:**
```bash
node scripts/uploadCSV.js "d:\kin\kkk.csv.csv" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YzAxNzU3OTU1ZmY2ZjU1NWJhNDM3MSIsImlhdCI6MTcxNDkwNTEyNH0.Sm0LAq-FjvI7X5e7YxX6Y2c4Z1..."
```

---

## ✅ Done!

You should see output like:
```
🚀 CSV Bulk Upload Tool
═══════════════════════════════════════════════════════════════════
📄 CSV File: d:\kin\kkk.csv.csv
🔗 API URL: http://localhost:5000/menu/bulk/upload
═══════════════════════════════════════════════════════════════════

📖 Parsing CSV file...
✓ Found 174 valid dishes

Preview of first 3 dishes:
  1. Mango Juice - ₹100
  2. Apple Juice - ₹70
  3. Orange Juice - ₹70

📤 Uploading 174 dishes...
⏳ This may take a few minutes depending on image sizes...

✅ Upload Complete!
═══════════════════════════════════════════════════════════════════
📊 Total Processed: 174
✓ Successful: 174
✗ Failed: 0

📋 Sample Uploaded Dishes:
  1. Mango Juice
  2. Apple Juice
  3. Orange Juice
  ... and 171 more

🎉 All done! Check your database 🚀
```

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Image file not found" | Check image paths in CSV are correct and accessible |
| "Authorization failed" | Your JWT token is invalid/expired. Get a new one |
| "Cannot connect to server" | Make sure backend is running: `npm run dev` |
| Upload is very slow | Normal for 100+ dishes. Don't close the terminal! |
| "Missing required fields" | CSV must have `name` and `price` columns |

---

## 📋 CSV Format Required

Your CSV needs these columns:
```
name,price,category,subcategory,image,description
Mango Juice,100,Fresh Juices,Juices,C:\Users\Mohan\Downloads\kajuanjeer.jpg,Freshly squeezed
Apple Juice,70,Fresh Juices,Juices,C:\Users\Mohan\Downloads\kajuanjeer.jpg,Refreshing juice
```

**Required columns:** `name`, `price`  
**Optional columns:** `category`, `subcategory`, `image`, `description`

---

## 🎉 What Happens

1. Script reads your CSV
2. For each dish:
   - Uploads image to Cloudinary (if path provided)
   - Saves dish to MongoDB
   - Links image URL to dish
3. Shows success/failure summary

---

## 💾 Verify Upload

Check MongoDB:
```bash
# In MongoDB shell or Compass
db.dishes.count()                              # Total dishes
db.dishes.find({category: "Fresh Juices"})    # Find by category
```

Or visit API:
```bash
curl http://localhost:5000/menu
```

---

**Need help?** See `BULK_UPLOAD_GUIDE.md` for detailed info.
