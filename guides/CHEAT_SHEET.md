# ⚡ BULK UPLOAD - CHEAT SHEET

## 🚀 One-Liner Reference

```bash
# Install
npm install axios csv-parse

# Run backend
npm run dev

# Upload (NEW TERMINAL)
node scripts/uploadCSV.js "d:\kin\kkk.csv.csv" "jwt-token"
```

---

## 📋 CSV Requirements

| Column | Type | Required | Example |
|--------|------|----------|---------|
| name | string | ✅ | Mango Juice |
| price | number | ✅ | 100 |
| category | string | ❌ | Fresh Juices |
| image | path | ❌ | C:\Users\Mohan\Downloads\image.jpg |
| description | string | ❌ | Fresh mango juice |

---

## 🔑 JWT Token Locations

**Option 1: DevTools (FASTEST)**
```
1. F12 → Application
2. Cookies → find 'token'
3. Copy value
```

**Option 2: API Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"pwd\"}"
```

---

## 📊 Expected Output

```
🚀 CSV Bulk Upload Tool
═══════════════════════════════════════════════
📄 CSV File: d:\kin\kkk.csv.csv
🔗 API URL: http://localhost:5000/menu/bulk/upload
═══════════════════════════════════════════════

📖 Parsing CSV file...
✓ Found 174 valid dishes

📤 Uploading 174 dishes...
⏳ This may take a few minutes...

✅ Upload Complete!
═══════════════════════════════════════════════
📊 Total Processed: 174
✓ Successful: 174
✗ Failed: 0

🎉 All done!
```

---

## 🔴 Quick Fixes

| Error | Fix |
|-------|-----|
| "Image file not found" | Check image paths in CSV, use absolute paths |
| "Authorization failed" | Get new JWT token, make sure it's copied correctly |
| "Cannot connect" | Start backend with `npm run dev` |
| "Missing required fields" | CSV must have name + price columns |
| Very slow | Normal for 100+ items, don't close terminal |

---

## ✅ Pre-Flight Checklist

- [ ] Backend running: `npm run dev`
- [ ] CSV file exists at: `d:\kin\kkk.csv.csv`
- [ ] JWT token copied and ready
- [ ] Image paths in CSV are absolute and accessible
- [ ] Dependencies installed: `npm install axios csv-parse`

---

## 🎯 3-Step Process

```
STEP 1: Prepare
├─ npm install axios csv-parse
└─ npm run dev (in one terminal)

STEP 2: Get Token
├─ Open DevTools (F12)
├─ Find JWT token in Cookies/Storage
└─ Copy it

STEP 3: Upload
└─ node scripts/uploadCSV.js "file.csv" "token"
```

---

## 🔗 API Endpoints

```
Login
POST /api/auth/login

Get All Dishes
GET /menu

Bulk Upload ⭐
POST /menu/bulk/upload
├─ Auth: JWT token required
├─ Body: {dishes: [...]}
└─ Returns: {message, results}

Get Single Dish
GET /menu/:id
```

---

## 📝 CSV Example

```csv
name,price,category,image,description
Mango Juice,100,Fresh Juices,C:\Users\Mohan\Downloads\mango.jpg,Fresh mango juice
Apple Juice,70,Fresh Juices,C:\Users\Mohan\Downloads\apple.jpg,Refreshing apple juice
Orange Juice,70,Fresh Juices,C:\Users\Mohan\Downloads\orange.jpg,Citrus orange juice
```

---

## 🚨 Emergency Commands

```bash
# Check backend running
curl http://localhost:5000

# Get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -d "{\"email\":\"admin@example.com\",\"password\":\"pwd\"}" \
  -H "Content-Type: application/json"

# Check MongoDB
# In MongoDB Compass: db.dishes.find()

# Check total dishes uploaded
# In MongoDB: db.dishes.countDocuments()

# View single dish
curl http://localhost:5000/menu/<dish-id>
```

---

## 📂 Important Files

```
kingdomfoods/
├── backend/
│   ├── scripts/uploadCSV.js          ← RUN THIS
│   └── package.json                   ← npm install from here
├── kkk.csv.csv                        ← YOUR DATA
├── QUICK_START.md                     ← Read this first
└── BULK_UPLOAD_GUIDE.md               ← Detailed help
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Install dependencies | 1-2 min |
| Start backend | 10 sec |
| Get JWT token | 1 min |
| Upload 174 dishes | 5-10 min |
| **Total** | **8-15 min** |

---

## 🎓 Learning Resources

- `QUICK_START.md` - Fastest guide (5 min read)
- `BULK_UPLOAD_GUIDE.md` - Complete manual (10 min read)
- `ARCHITECTURE.md` - Technical deep dive (15 min read)
- `UPLOAD_CHECKLIST.md` - Step-by-step verification

---

## 💡 Pro Tips

✅ Test with 5 dishes first  
✅ Use absolute paths for images  
✅ Don't close terminal during upload  
✅ Same image can be used for multiple dishes  
✅ Re-run script if partial failure  
✅ Check MongoDB to verify  

---

## 🎯 Success Criteria

- ✅ Script runs without errors
- ✅ Shows "✓ Successful: XXX"
- ✅ Images uploaded to Cloudinary
- ✅ Dishes appear in MongoDB
- ✅ API returns new dishes

---

## 📞 Quick Help

**Problem?** Check in this order:
1. `QUICK_START.md` - Fastest solution
2. `BULK_UPLOAD_GUIDE.md` - Detailed help
3. Script error message - Usually tells the problem
4. Check backend logs - `npm run dev` output

---

**Ready? Start here:** `QUICK_START.md` 🚀

---

**Version:** 1.0 | **Date:** Dec 8, 2025 | **Status:** Ready
