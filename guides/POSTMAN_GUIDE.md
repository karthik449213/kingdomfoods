# Postman Guide - KingdomFoods API

## Base URL
```
http://localhost:5000
```

---

## 🔐 Step 1: Register Admin (One-time only)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (Raw JSON):
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

### Response (Success)
```json
{
  "success": true,
  "admin": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "admin",
    "createdAt": "2024-01-15T10:30:45.000Z",
    "updatedAt": "2024-01-15T10:30:45.000Z"
  }
}
```

---

## 🔑 Step 2: Login Admin

### Request
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (Raw JSON):
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

### Response (Success)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### ⚠️ Important: Save the Token
Copy the `token` value from the response. You'll need this for all admin operations.

**Example Token** (for testing purposes):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTFiMmMzZDRlNWY2ZzcyOGk5ajBrMSIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MDUzMjU4NDUsImV4cCI6MTcwNTkzMDY0NX0.abc123xyz456
```

---

## 📂 Step 3: Add a Category

### Request
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/menu/categories`
- **Headers**:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- **Body**: Form-data
  - Key: `name` → Value: `Appetizers`
  - Key: `image` → Value: (Select your image file)

### Steps in Postman:
1. Set Method to **POST**
2. Enter URL: `http://localhost:5000/api/menu/categories`
3. Go to **Headers** tab
4. Add header:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Go to **Body** tab
6. Select **form-data**
7. Add two fields:
   - **name** (text): `Appetizers`
   - **image** (file): Choose your image file
8. Click **Send**

### Response (Success)
```json
{
  "_id": "65a2c3d4e5f6g7h8i9j0k1l2",
  "name": "Appetizers",
  "image": "https://res.cloudinary.com/...",
  "createdAt": "2024-01-15T11:45:30.000Z",
  "updatedAt": "2024-01-15T11:45:30.000Z"
}
```

---

## 🍽️ Step 4: Add a Dish

### Request
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/menu/dishes`
- **Headers**:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- **Body**: Form-data
  - Key: `name` → Value: `Samosa`
  - Key: `price` → Value: `5.99`
  - Key: `description` → Value: `Crispy pastry filled with spiced potatoes and peas`
  - Key: `category` → Value: `CATEGORY_ID_HERE` (from Step 3)
  - Key: `stars` → Value: `4.5`
  - Key: `image` → Value: (Select your image file)

### Steps in Postman:
1. Set Method to **POST**
2. Enter URL: `http://localhost:5000/api/menu/dishes`
3. Go to **Headers** tab
4. Add header:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Go to **Body** tab
6. Select **form-data**
7. Add fields:
   - **name** (text): `Samosa`
   - **price** (text): `5.99`
   - **description** (text): `Crispy pastry filled with spiced potatoes and peas`
   - **category** (text): `65a2c3d4e5f6g7h8i9j0k1l2` (Copy from Step 3 response)
   - **stars** (text): `4.5`
   - **image** (file): Choose your image file
8. Click **Send**

### Response (Success)
```json
{
  "_id": "65a3d4e5f6g7h8i9j0k1l2m3",
  "name": "Samosa",
  "price": 5.99,
  "description": "Crispy pastry filled with spiced potatoes and peas",
  "stars": 4.5,
  "image": "https://res.cloudinary.com/...",
  "imagePublicId": "restaurant_menu/dishes/abc123",
  "category": "65a2c3d4e5f6g7h8i9j0k1l2",
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

---

## 📋 Step 5: View All Categories

### Request
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/menu/categories`
- **Headers**: None required (public endpoint)

### Response
```json
[
  {
    "_id": "65a2c3d4e5f6g7h8i9j0k1l2",
    "name": "Appetizers",
    "image": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-15T11:45:30.000Z",
    "updatedAt": "2024-01-15T11:45:30.000Z"
  },
  {
    "_id": "65a3c3d4e5f6g7h8i9j0k1l3",
    "name": "Main Course",
    "image": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-15T11:50:00.000Z",
    "updatedAt": "2024-01-15T11:50:00.000Z"
  }
]
```

---

## 🍴 Step 6: View All Dishes

### Request
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/menu/dishes`
- **Headers**: None required (public endpoint)

### Response
```json
[
  {
    "_id": "65a3d4e5f6g7h8i9j0k1l2m3",
    "name": "Samosa",
    "price": 5.99,
    "description": "Crispy pastry filled with spiced potatoes and peas",
    "stars": 4.5,
    "image": "https://res.cloudinary.com/...",
    "imagePublicId": "restaurant_menu/dishes/abc123",
    "category": {
      "_id": "65a2c3d4e5f6g7h8i9j0k1l2",
      "name": "Appetizers",
      "image": "https://res.cloudinary.com/..."
    },
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
]
```

---

## ✏️ Step 7: Update a Category

### Request
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/menu/categories/CATEGORY_ID`
- **Headers**:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- **Body**: Form-data
  - Key: `name` → Value: `Starters` (optional)
  - Key: `image` → Value: (Select new image file - optional)

### Example:
Replace `CATEGORY_ID` with actual ID: `65a2c3d4e5f6g7h8i9j0k1l2`

**URL**: `http://localhost:5000/api/menu/categories/65a2c3d4e5f6g7h8i9j0k1l2`

---

## 🔄 Step 8: Update a Dish

### Request
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/menu/dishes/DISH_ID`
- **Headers**:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- **Body**: Form-data (all optional)
  - Key: `name` → Value: `New Dish Name`
  - Key: `price` → Value: `7.99`
  - Key: `description` → Value: `Updated description`
  - Key: `stars` → Value: `4.8`
  - Key: `category` → Value: `CATEGORY_ID`
  - Key: `image` → Value: (Select new image file)

### Example:
Replace `DISH_ID` with actual ID: `65a3d4e5f6g7h8i9j0k1l2m3`

**URL**: `http://localhost:5000/api/menu/dishes/65a3d4e5f6g7h8i9j0k1l2m3`

---

## 🗑️ Step 9: Delete a Category

### Request
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/menu/categories/CATEGORY_ID`
- **Headers**:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

### Response (Success)
```json
{
  "success": true
}
```

### Note:
❌ Cannot delete a category that has dishes. Delete all dishes first.

---

## 🗑️ Step 10: Delete a Dish

### Request
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/menu/dishes/DISH_ID`
- **Headers**:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

### Response (Success)
```json
{
  "success": true
}
```

---

## 📊 Step 11: Get Full Menu (Categories with Dishes)

### Request
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/menu/full`
- **Headers**: None required (public endpoint)

### Response
```json
[
  {
    "_id": "65a2c3d4e5f6g7h8i9j0k1l2",
    "name": "Appetizers",
    "image": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-15T11:45:30.000Z",
    "updatedAt": "2024-01-15T11:45:30.000Z",
    "dishes": [
      {
        "_id": "65a3d4e5f6g7h8i9j0k1l2m3",
        "name": "Samosa",
        "price": 5.99,
        "description": "Crispy pastry filled with spiced potatoes and peas",
        "stars": 4.5,
        "image": "https://res.cloudinary.com/...",
        "category": "65a2c3d4e5f6g7h8i9j0k1l2"
      }
    ]
  }
]
```

---

## 🔑 Postman Environment Variables (Optional)

To make it easier, set up environment variables in Postman:

1. Click **Environment** (top right)
2. Click **Create**
3. Name it: `KingdomFoods`
4. Add variables:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:5000` |
| `token` | `YOUR_JWT_TOKEN_HERE` |
| `category_id` | `CATEGORY_ID_FROM_RESPONSE` |
| `dish_id` | `DISH_ID_FROM_RESPONSE` |

5. Then use `{{base_url}}` and `{{token}}` in your requests

### Example:
- **URL**: `{{base_url}}/api/menu/categories`
- **Authorization Header**: `Bearer {{token}}`

---

## ⚠️ Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Missing or invalid token | Copy the correct token from login response |
| `400 Bad Request` | Missing required field | Check all required fields are provided |
| `404 Not Found` | Invalid category/dish ID | Use correct ID from response |
| `403 Forbidden` | Not an admin route | Ensure you have authorization header |
| `Error: image is required` | No image file selected | Select an image file in form-data |

---

## 🎯 Quick Workflow Summary

```
1. Register Admin (ONE TIME)
   POST /api/auth/register

2. Login Admin
   POST /api/auth/login
   → Get TOKEN

3. Create Categories
   POST /api/menu/categories
   → Get CATEGORY_ID

4. Create Dishes (use CATEGORY_ID)
   POST /api/menu/dishes

5. View Data
   GET /api/menu/categories
   GET /api/menu/dishes
   GET /api/menu/full

6. Update (if needed)
   PUT /api/menu/categories/{id}
   PUT /api/menu/dishes/{id}

7. Delete (if needed)
   DELETE /api/menu/categories/{id}
   DELETE /api/menu/dishes/{id}
```

---

## 📝 Sample Data for Testing

### Category Examples:
- Appetizers
- Main Course
- Desserts
- Beverages
- Soups

### Dish Examples:
- **Samosa** - Price: 5.99, Rating: 4.5
- **Biryani** - Price: 12.99, Rating: 4.8
- **Butter Chicken** - Price: 14.99, Rating: 4.7
- **Paneer Tikka** - Price: 10.99, Rating: 4.6
- **Gulab Jamun** - Price: 6.99, Rating: 4.9

---

## 🚀 Testing Tips

1. **Keep Postman Organized**: Create folders for Auth, Categories, and Dishes
2. **Save Responses**: Use test scripts to automatically extract IDs
3. **Use Variables**: Store token and IDs in environment variables
4. **Test Public Endpoints First**: GET requests don't need authentication
5. **Test with Images**: Use real image files to ensure Cloudinary integration works

---

**Happy Testing! 🎉**
