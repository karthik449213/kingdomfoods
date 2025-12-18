# 🔄 RE-UPLOAD INSTRUCTIONS

## ❌ What Happened

Your CSV has `image` column but controller was looking for `imagePath`.

**Result:**
- ✗ Images not uploaded to Cloudinary
- ✗ MongoDB shows `imagePublicId: null`
- ✗ MongoDB shows `subCategory: null`

## ✅ What Was Fixed

Changed controller to use `image` column name from your CSV:

```javascript
// Before: const { name, price, description, category, imagePath } = dishData;
// After:  const { name, price, description, category, image } = dishData;
```

---

## 🚀 RE-UPLOAD PROCEDURE

### Step 1: Delete Existing Dishes

**In MongoDB Compass or Shell:**

```bash
# Delete all dishes that were just uploaded
db.dishes.deleteMany({name: "Mango Juice"})

# Or delete all if you want a fresh start:
db.dishes.deleteMany({})
```

**Or in MongoDB Compass:**
1. Go to `kingdomfoods` database
2. Go to `dishes` collection
3. Click all rows with your dishes
4. Delete them

---

### Step 2: Restart Backend

```bash
# Terminal 1: Stop current backend
# Press Ctrl+C

# Then restart:
npm run dev
```

---

### Step 3: Re-upload CSV

**In Terminal 2:**

```bash
node scripts/uploadCSV.js "d:\kin\kingdomfoods\backend\h.csv" "YOUR_JWT_TOKEN"
```

---

## ✅ EXPECTED RESULT THIS TIME

MongoDB will show:
```javascript
{
  name: "Mango Juice",
  price: 100,
  description: "Freshly squeezed...",
  image: "https://res.cloudinary.com/xxx/kajuanjeer.jpg",  // ✅ HAS IMAGE NOW!
  imagePublicId: "restaurant_menu/kajuanjeer_xyz",         // ✅ HAS ID NOW!
  subCategory: null,  // Still null (string category)
  stars: 0
}
```

✅ Images will be uploaded to Cloudinary  
✅ Image URLs will be in MongoDB  
✅ imagePublicId will be populated  

---

## 🎯 QUICK STEPS

1. Delete old dishes: `db.dishes.deleteMany({})`
2. Restart backend: `npm run dev`
3. Re-upload: `node scripts/uploadCSV.js "d:\kin\kingdomfoods\backend\h.csv" "token"`
4. Done! All 174 dishes with images ✨

---

**Time to fix:** 5 minutes  
**Expected success:** 100%
