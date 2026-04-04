# InventIQ API - Thunder Client Collection Guide

## 📋 Server Configuration

**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Bearer Token  
**Timezone:** Auto-detect

---

## 🔐 Authentication Setup

All protected endpoints require a **Bearer Token** in the Authorization header:
```
Authorization: Bearer {token}
```

**To get a token:**
1. Use **Register** or **Login** endpoint first
2. Copy the `token` from the response
3. Add it to other requests in the Authorization header

---

## 📡 API Endpoints

### 1️⃣ **AUTH ROUTES** (`/api/auth`)

#### Register New User
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/register`
- **Auth:** None
- **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "shopName": "My Shop",
  "language": "en",
  "phone": "+1234567890"
}
```
- **Response:** `201 Created`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "shopName": "My Shop",
  "language": "en",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login User
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Auth:** None
- **Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:** `200 OK` (Same as register response)

#### Get Profile
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/auth/profile`
- **Auth:** `Bearer {token}` ✅ Required
- **Body:** None
- **Response:** `200 OK`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "shopName": "My Shop",
  "language": "en",
  "phone": "+1234567890"
}
```

#### Update Profile
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/auth/profile`
- **Auth:** `Bearer {token}` ✅ Required
- **Body (JSON):**
```json
{
  "name": "Jane Doe",
  "shopName": "Updated Shop",
  "language": "es",
  "phone": "+9876543210",
  "password": "newPassword123"
}
```
- **Response:** `200 OK` (Returns updated user and new token)

---

### 2️⃣ **INVENTORY ROUTES** (`/api/inventory`)

#### Get All Inventory Items
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/inventory`
- **Auth:** `Bearer {token}` ✅ Required
- **Body:** None
- **Response:** `200 OK`
```json
[
  {
    "_id": "item_id",
    "name": "Product Name",
    "sku": "SKU123",
    "quantity": 50,
    "price": 99.99,
    "reorderLevel": 10,
    "category": "Electronics"
  }
]
```

#### Get Low Stock Items
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/inventory/low-stock`
- **Auth:** `Bearer {token}` ✅ Required
- **Body:** None
- **Response:** `200 OK` (Returns only items below reorder level)

#### Add Inventory Item
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/inventory`
- **Auth:** `Bearer {token}` ✅ Required
- **Body (JSON):**
```json
{
  "name": "Laptop",
  "sku": "SKU001",
  "quantity": 25,
  "price": 1299.99,
  "reorderLevel": 5,
  "category": "Electronics"
}
```
- **Response:** `201 Created`

#### Update Inventory Item
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/inventory/{id}`
- **Auth:** `Bearer {token}` ✅ Required
- **Params:** `id` = Item ID
- **Body (JSON):**
```json
{
  "quantity": 30,
  "price": 1199.99,
  "reorderLevel": 8
}
```
- **Response:** `200 OK`

#### Delete Inventory Item
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/inventory/{id}`
- **Auth:** `Bearer {token}` ✅ Required
- **Params:** `id` = Item ID
- **Body:** None
- **Response:** `200 OK`

---

### 3️⃣ **CHAT ROUTES** (`/api/chat`)

#### Send Chat Message
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/chat`
- **Auth:** `Bearer {token}` ✅ Required
- **Body (JSON):**
```json
{
  "message": "What's the inventory level?"
}
```
- **Response:** `200 OK`
```json
{
  "reply": "Current inventory shows...",
  "metadata": {}
}
```

#### Get Chat History
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/chat/history`
- **Auth:** `Bearer {token}` ✅ Required
- **Body:** None
- **Response:** `200 OK`
```json
[
  {
    "_id": "msg_id",
    "userId": "user_id",
    "message": "What's the inventory level?",
    "reply": "Current inventory shows...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Sales Report
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/chat/reports`
- **Auth:** `Bearer {token}` ✅ Required
- **Body:** None
- **Response:** `200 OK`
```json
{
  "totalSales": 5000,
  "period": "This Month",
  "details": []
}
```

---

### 4️⃣ **HEALTH CHECK** (Public)

#### Server Health
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/health`
- **Auth:** None
- **Body:** None
- **Response:** `200 OK`
```json
{
  "status": "InventIQ server running"
}
```

---

## 🔑 Environment Variables Needed

Create a `.env` file in the `server/` directory:

```
PORT=5000
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📝 Thunder Client Import Steps

1. **Open Thunder Client** in VS Code
2. **Create New Environment:**
   - Name: `InventIQ Local`
   - Variables:
     - `baseUrl`: `http://localhost:5000/api`
     - `token`: (Leave empty, will be filled after login)

3. **Create Collections:**
   - Auth
   - Inventory
   - Chat
   - Health Check

4. **Add Requests** using the specifications above

5. **Auto-fill token:** After login request, set the token variable:
   ```
   Env: token = {{response.body.token}}
   ```

---

## ✅ Testing Workflow

1. **Health Check** (verify server is running)
2. **Register or Login** (get token)
3. **Copy token** to environment variables
4. **Test Protected Routes** (inventory, chat, profile)

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token missing/expired. Re-login to get new token |
| 400 Bad Request | Check request body fields match required schema |
| 500 Server Error | Check server console for error details |
| CORS Error | Ensure `CLIENT_URL` in `.env` matches your client URL |

