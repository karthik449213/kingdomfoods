# 🚀 CSV Bulk Upload Guide

## Overview
This guide explains how to upload 100+ dishes from your CSV file to the database and Cloudinary in minutes.

---

## ✅ Step 1: Install Dependencies

Go to backend folder and install required packages:

```bash
cd d:\kin\kingdomfoods\backend
npm install axios csv-parse
```

---

## ✅ Step 2: Prepare Your CSV File

Your CSV file should have these columns:
- `name` - Dish name (required)
- `price` - Price in rupees (required)
- `category` - Category name
- `subcategory` - Sub-category
- `image` - Full path to image file on your computer
- `description` - Dish description

**Example:**
```csv
name,price,category,subcategory,image,description
Mango Juice,100,Fresh Juices,Juices,C:\Users\Mohan\Downloads\kajuanjeer.jpg,Freshly squeezed mango juice
Apple Juice,70,Fresh Juices,Juices,C:\Users\Mohan\Downloads\kajuanjeer.jpg,Refreshing apple juice
```

---

## ✅ Step 3: Get Your Admin JWT Token

### Option A: Login via API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin-email@example.com","password":"your-password"}'
```

You'll get a response with `token` field. Copy it.

### Option B: Get Token from Frontend
1. Login to your admin panel in the browser
2. Open DevTools (F12)
3. Go to Application > Cookies
4. Find and copy the JWT token

---

## ✅ Step 4: Create an Environment File (Optional)

Create `backend/.env` with your token:

```env
ADMIN_JWT_TOKEN=your-jwt-token-here
API_URL=http://localhost:5000
```

---

## ✅ Step 5: Run the Upload Script

### Using Command Line

**Basic upload:**
```bash
cd d:\kin\kingdomfoods\backend
node scripts/bulkUpload.js d:\kin\kkk.csv.csv http://localhost:5000/menu/bulk/upload "your-jwt-token"
```

**All parameters:**
```bash
node scripts/bulkUpload.js <CSV_FILE> <API_URL> <JWT_TOKEN>
```

**Example with your file:**
```bash
node scripts/bulkUpload.js "d:\kin\kkk.csv.csv" "http://localhost:5000/menu/bulk/upload" "eyJhbGciOiJIUzI1NiIs..."
```
"
---

## ✅ Step 6: Monitor Upload Progress

The script will show:
- ✓ Number of successful uploads
- ✗ Number of failed uploads
- 📋 List of uploaded dishes
- ⚠️ Error details for any failures

---

## 📊 API Endpoints (For Reference)

### Bulk Upload (Local Image Paths)
```
POST /menu/bulk/upload
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "dishes": [
    {
      "name": "Mango Juice",
      "price": 100,
      "category": "Fresh Juices",
      "description": "...",
      "imagePath": "C:\\Users\\Mohan\\Downloads\\kajuanjeer.jpg"
    }
  ]
}
```

### Response Example
```json
{
  "message": "Bulk upload completed. 150 successful, 5 failed.",
  "results": {
    "success": [
      {"dish": "Mango Juice", "id": "...", "image": "https://res.cloudinary.com/..."}
    ],
    "failed": [
      {"dish": "Unknown Dish", "error": "Image file not found"}
    ],
    "totalProcessed": 155
  }
}
```

---

## 🔧 Troubleshooting

### "Image file not found"
- Make sure image paths in CSV are correct and accessible
- Use full absolute paths like `C:\Users\Mohan\Downloads\image.jpg`

### "Missing required fields: name and price"
- Check CSV has `name` and `price` columns
- All rows must have these values

### "Authorization failed"
- Make sure JWT token is valid and not expired
- Token format should be: `eyJhbGciOiJIUzI1NiIs...`

### "Connection refused / Cannot reach server"
- Make sure backend is running: `npm run dev`
- Check API URL is correct: `http://localhost:5000`

### "Upload is slow"
- Don't close terminal while uploading
- For 100+ items, upload can take 5-10 minutes
- Cloudinary upload speed depends on internet connection

---

## 💡 Tips

1. **Test first**: Try uploading 5 dishes before full 100+
2. **Same image for multiple dishes?**: Add the same image path in CSV multiple times
3. **Re-upload after error?**: The script will only fail on bad rows, good ones are saved
4. **Want to check database?**: Query MongoDB directly:
   ```bash
   db.dishes.count()  # Total dishes
   db.dishes.find({category: "Fresh Juices"})  # Find by category
   ```

---

## 🎉 Quick Start (TL;DR)

```bash
# 1. Install packages
cd d:\kin\kingdomfoods\backend
npm install axios csv-parse

# 2. Start backend
npm run dev

# 3. Get your JWT token (login first or use DevTools)

# 4. Upload your CSV
node scripts/bulkUpload.js "d:\kin\kkk.csv.csv" "http://localhost:5000/menu/bulk/upload" "your-jwt-token"

# Done! ✨
```

---

## 📝 CSV Format Reference

| Column | Type | Required | Example |
|--------|------|----------|---------|
| name | String | ✅ Yes | Mango Juice |
| price | Number | ✅ Yes | 100 |
| category | String | ❌ No | Fresh Juices |
| subcategory | String | ❌ No | Juices |
| image | String (path) | ❌ No | C:\Users\Mohan\...\image.jpg |
| description | String | ❌ No | Freshly squeezed... |

---

Need help? Check the API response for specific error messages!
