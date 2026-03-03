# Elentec2 - Full Stack Application với Role-Based Authentication

Ứng dụng full-stack sử dụng **React + Vite** (frontend) và **Node.js + Express + MongoDB** (backend) với hệ thống phân quyền 4 cấp.

## 🎯 Tính năng chính

- ✅ Authentication (Đăng ký, đăng nhập, đăng xuất)
- ✅ Hệ thống phân quyền 4 cấp: User, Moderator, Admin, SuperAdmin
- ✅ JWT Access Token + Refresh Token (Cookie)
- ✅ Protected Routes theo từng role
- ✅ Admin Panel để quản lý users và phân quyền
- ✅ Moderator Panel để xem danh sách users
- ✅ Invoice management

## 🔐 Phân quyền

### 1. **User** (Người dùng thông thường)

- Đăng ký, đăng nhập, đăng xuất
- Quản lý invoices
- Xem profile

### 2. **Moderator** (Người kiểm duyệt)

- Tất cả quyền của User
- Xem danh sách tất cả users
- Lọc users theo role
- Xem chi tiết user

### 3. **Admin** (Quản trị viên)

- Tất cả quyền của Moderator
- Gán role cho users (user, moderator, admin)
- Xoá role từ users

### 4. **SuperAdmin** (Siêu quản trị)

- Tất cả quyền của Admin
- Gán role superadmin
- Xóa users khỏi hệ thống

## 📁 Cấu trúc dự án

```
Elentec2/
├── backend/                 # Backend cũ (có thể bỏ)
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── auth/      # Auth components (ProtectedRouter, RoleProtectedRoute)
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # UI components
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Page components
│   │   │   ├── Auth/      # Login, SignUp
│   │   │   ├── Dashboard/ # Dashboard
│   │   │   ├── Admin/     # AdminPanel
│   │   │   ├── Moderator/ # ModeratorPanel
│   │   │   └── ...
│   │   └── utils/         # Utilities (axios, apiPaths)
│   ├── .env               # Environment variables
│   └── package.json
└── server/                # Node.js + Express backend
    ├── src/
    │   ├── controllers/   # Business logic
    │   ├── middlewares/   # Auth middleware
    │   ├── models/        # MongoDB models
    │   ├── routes/        # API routes
    │   ├── libs/          # Database connection
    │   └── server.js      # Entry point
    ├── .env               # Environment variables
    └── package.json
```

## 🚀 Cài đặt và Chạy

### Prerequisites

- Node.js (v18+)
- MongoDB (locally hoặc MongoDB Atlas)
- npm hoặc yarn

### 1. Clone repository

```bash
cd Desktop/Elentec2
```

### 2. Setup Backend (Server)

```bash
cd server
npm install
```

Tạo file `.env` trong folder `server`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/elentec2
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Chạy server:

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5001`

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

File `.env` đã có sẵn:

```env
VITE_API_URL=http://localhost:5001/api
```

Chạy frontend:

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📡 API Endpoints

### Public Routes

```
POST /api/auth/signup       # Đăng ký
POST /api/auth/signin       # Đăng nhập
```

### Protected Routes (cần token)

```
POST /api/auth/signout      # Đăng xuất
```

### Moderator Routes (moderator+)

```
GET /api/auth/moderator/users                  # Lấy tất cả users
GET /api/auth/moderator/users/:userId          # Lấy user theo ID
GET /api/auth/moderator/users/role/:role       # Lấy users theo role
```

### Admin Routes (admin+)

```
POST /api/auth/admin/assign-role               # Gán role
POST /api/auth/admin/remove-role               # Xóa role
GET  /api/auth/admin/all-users                 # Lấy tất cả users
GET  /api/auth/admin/users/:userId             # Lấy user theo ID
GET  /api/auth/admin/users/role/:role          # Lấy users theo role
```

### SuperAdmin Routes (superadmin only)

```
DELETE /api/auth/superadmin/delete-user        # Xóa user
POST   /api/auth/superadmin/assign-role        # Gán role (bao gồm superadmin)
POST   /api/auth/superadmin/remove-role        # Xóa role
```

## 🔧 Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Axios
- Tailwind CSS 4
- Lucide React (icons)
- React Hot Toast

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- cookie-parser
- cors

## 📝 Cách sử dụng

### 1. Đăng ký tài khoản

- Truy cập `http://localhost:5173/signup`
- Điền thông tin: username, email, displayName, password
- Mặc định role là `user`

### 2. Đăng nhập

- Truy cập `http://localhost:5173/login`
- Nhập username và password
- Sau khi login, bạn sẽ được redirect về `/dashboard`

### 3. Gán role Admin (Manual - qua MongoDB)

Để test chức năng admin, bạn cần gán role manually trong MongoDB:

```javascript
// Mở MongoDB shell hoặc Compass
db.users.updateOne(
  { username: "your_username" },
  { $set: { role: "superadmin" } },
);
```

### 4. Sử dụng Admin Panel

- SuperAdmin login → Truy cập `/admin`
- Gán role cho users khác
- Xóa users (nếu cần)

## 🎨 Frontend Routes

```
/                    # Landing page
/signup              # Đăng ký
/login               # Đăng nhập
/dashboard           # Dashboard (protected)
/invoices            # Quản lý invoices (protected)
/profile             # Profile settings (protected)
/moderator           # Moderator Panel (moderator+)
/admin               # Admin Panel (admin+)
```

## 🛡️ Security Features

- ✅ Password hashing với bcrypt (salt=10)
- ✅ JWT với expiration (90 minutes)
- ✅ Refresh token trong HTTP-only cookies
- ✅ Session-based refresh tokens trong MongoDB
- ✅ Auto logout khi token hết hạn
- ✅ CORS protection
- ✅ Role-based access control middleware

## 🐛 Troubleshooting

### MongoDB connection error

- Kiểm tra MongoDB có đang chạy không: `mongod`
- Kiểm tra MONGO_URI trong `.env`

### CORS error

- Kiểm tra CLIENT_URL trong server `.env`
- Đảm bảo frontend đang chạy trên port 5173

### Token expired

- Logout và login lại
- Clear localStorage trong browser DevTools

## 📄 License

MIT

## 👤 Author

Elentec Team
