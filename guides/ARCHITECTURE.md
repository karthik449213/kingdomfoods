# 🏗️ Bulk Upload Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR COMPUTER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  CSV FILE (kkk.csv.csv)                                          │
│  ├─ name, price, category, image, description                   │
│  ├─ 174 dishes                                                   │
│  └─ Image paths pointing to local files                          │
│                                                                   │
│              ↓                                                    │
│                                                                   │
│  UPLOAD SCRIPT (uploadCSV.js)                                    │
│  ├─ Reads CSV file                                              │
│  ├─ Parses each row                                             │
│  ├─ Validates data                                              │
│  └─ Sends to API with JWT token                                 │
│                                                                   │
│              ↓ (HTTP POST)                                       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  API Endpoint: POST /menu/bulk/upload                           │
│  ├─ Verify JWT token (admin only)                              │
│  ├─ Parse request body                                          │
│  ├─ For each dish:                                              │
│  │  ├─ Validate (name, price required)                         │
│  │  ├─ Read image from local path                              │
│  │  ├─ Upload to Cloudinary                                    │
│  │  ├─ Create Dish document                                    │
│  │  └─ Save to MongoDB                                         │
│  └─ Return results (success/failure summary)                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓
    [MongoDB]      [Cloudinary]   [Response]
       (Save)        (Images)      (JSON)
```

## Detailed Flow Diagram

```
START
  ↓
┌─ INITIALIZE ─────────────────┐
│ • Read command line args      │
│ • Verify file exists          │
│ • Set API URL & JWT token     │
└───────────┬───────────────────┘
            ↓
┌─ PARSE CSV ───────────────────────┐
│ • Read file                        │
│ • Split by newlines                │
│ • Extract header row               │
│ • Parse each data row              │
│ • Filter empty rows                │
│ • Validate required fields         │
└───────────┬────────────────────────┘
            ↓
┌─ PREPARE DATA ────────────────────┐
│ • Group dishes by category        │
│ • Validate prices (numeric)       │
│ • Check image paths exist         │
│ • Create JSON payload             │
└───────────┬──────────────────────┘
            ↓
┌─ CONNECT TO API ──────────────────┐
│ • Set headers                     │
│ • Add Authorization token         │
│ • Configure timeout               │
│ • Set Content-Type                │
└───────────┬──────────────────────┘
            ↓
┌─ SEND REQUEST ────────────────────┐
│ • POST to /menu/bulk/upload       │
│ • Body = {dishes: [...]}          │
│ • Retry on timeout (optional)     │
└───────────┬──────────────────────┘
            ↓
            ├─ BACKEND PROCESSING ─────┐
            │                           │
            │ ┌─ FOR EACH DISH ──────┐ │
            │ │ 1. Validate data     │ │
            │ │ 2. Upload image      │ │
            │ │ 3. Create dish doc   │ │
            │ │ 4. Save to DB        │ │
            │ │ 5. Track result      │ │
            │ └──────────────────────┘ │
            │                           │
            └──────────┬────────────────┘
                       ↓
┌─ RECEIVE RESPONSE ────────────────┐
│ • Parse JSON response             │
│ • Extract success count           │
│ • Extract failure count           │
│ • Get error details               │
└───────────┬────────────────────────┘
            ↓
┌─ DISPLAY RESULTS ─────────────────┐
│ • Show summary stats              │
│ • List uploaded dishes            │
│ • Show error messages             │
│ • Provide next steps              │
└───────────┬────────────────────────┘
            ↓
         SUCCESS / FAILURE
            ↓
          END
```

## Data Flow: Single Dish Upload

```
CSV Row:
  name: "Mango Juice"
  price: 100
  image: "C:\Users\Mohan\Downloads\kajuanjeer.jpg"
  description: "Fresh mango juice"

           ↓ (Parsed)

JSON Object:
  {
    "name": "Mango Juice",
    "price": 100,
    "image": "C:\Users\Mohan\...\kajuanjeer.jpg",
    "description": "Fresh mango juice"
  }

           ↓ (Sent to API)

Backend Processing:
  1. Validate: ✓ name exists, ✓ price is number
  2. Read image file from C:\Users\Mohan\...
  3. Upload to Cloudinary:
     • Endpoint: https://api.cloudinary.com/...
     • Returns: {
         "secure_url": "https://res.cloudinary.com/xxx/mango.jpg",
         "public_id": "restaurant_menu/mango_12345"
       }
  4. Create Mongoose document:
     • name: "Mango Juice"
     • price: 100
     • description: "Fresh mango juice"
     • image: "https://res.cloudinary.com/xxx/mango.jpg"
     • imagePublicId: "restaurant_menu/mango_12345"
  5. Save to MongoDB:
     • Collection: "dishes"
     • Document ID: "67a1b2c3d4e5f6g7h8i9j0k1"

           ↓ (Database updated)

MongoDB:
  dishes {
    "_id": "67a1b2c3...",
    "name": "Mango Juice",
    "price": 100,
    "description": "Fresh mango juice",
    "image": "https://res.cloudinary.com/xxx/mango.jpg",
    "imagePublicId": "restaurant_menu/mango_12345",
    "timestamps": {...}
  }

           ↓ (Response sent back)

API Response:
  {
    "message": "Bulk upload completed...",
    "results": {
      "success": [{
        "dish": "Mango Juice",
        "id": "67a1b2c3...",
        "image": "https://res.cloudinary.com/xxx/mango.jpg"
      }],
      "failed": [],
      "totalProcessed": 1
    }
  }

           ↓ (Displayed to user)

Console Output:
  ✓ Mango Juice
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│          Frontend (User)                 │
│  • VS Code Terminal                     │
│  • Script Runner (Node.js)              │
└────────────┬────────────────────────────┘
             │
             ├─ uploadCSV.js (Node.js script)
             │  • Axios (HTTP client)
             │  • fs (File system)
             │  • CSV parsing
             │
┌────────────┴────────────────────────────┐
│      Backend API (Express.js)            │
│  • bulkUploadController.js              │
│  • JWT authentication                    │
│  • Mongoose (MongoDB ODM)               │
│  • Cloudinary SDK                       │
└────────────┬────────────────────────────┘
             │
             ├─→ MongoDB Database
             │   └─ Collections: dishes
             │
             └─→ Cloudinary CDN
                 └─ Folder: restaurant_menu
                    └─ Images: *.jpg, *.png
```

## Security Flow

```
User has CSV + JWT Token
         ↓
Script includes JWT in Authorization header
         ↓
Backend receives request
         ↓
adminAuth middleware checks JWT
         ↓
     ├─ Valid? → Continue processing
     │
     └─ Invalid? → Return 401 Unauthorized
                    (Terminate request)
```

## Error Handling Flow

```
Upload Request
     ↓
     ├─ File not found?
     │  └─ Error: "Image file not found"
     │
     ├─ Invalid token?
     │  └─ Error: "Authorization failed"
     │
     ├─ Missing name/price?
     │  └─ Error: "Missing required fields"
     │
     ├─ Cloudinary upload fails?
     │  └─ Error: "Image upload failed"
     │
     ├─ Database save fails?
     │  └─ Error: "Database error"
     │
     └─ All checks pass?
        └─ Success: Dish saved
```

---

## Performance Metrics

For 174 dishes (your CSV):

```
Operation              | Time      | Notes
-----------------------|-----------|------------------
CSV Parsing           | < 1 sec   | Fast file reading
Image Upload (each)   | 2-10 sec  | Depends on file size
DB Save (each)        | < 100 ms  | Very fast
Total Time            | 5-15 min  | ~3-5 sec per dish
Success Rate          | 95-99%    | If data valid
```

---

**This is the complete architecture of your bulk upload system!** 🏗️
