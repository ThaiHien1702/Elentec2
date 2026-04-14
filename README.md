# Elentec2 - Hệ thống Quản lý Ra/Vào & Tài sản CNTT

Ứng dụng full-stack **React + Vite** (frontend) và **Node.js + Express + MongoDB** (backend) dành cho quản lý quy trình ra/vào cổng (Gate Access), quản lý tài sản IT, phòng ban, và nhân sự với hệ thống phân quyền kết hợp Role + Position.

---

## Mục lục

1. [Tính năng chính](#tính-năng-chính)
2. [Cài đặt và Chạy](#cài-đặt-và-chạy)
3. [Tạo Admin đầu tiên](#tạo-admin-đầu-tiên)
4. [Quick Start — Test flow Gate Access](#quick-start--test-flow-gate-access)
5. [Phân quyền](#phân-quyền)
6. [Luồng nghiệp vụ Gate Access](#luồng-nghiệp-vụ-gate-access)
7. [Frontend Routes](#frontend-routes)
8. [API Endpoints](#api-endpoints)
9. [Cấu trúc dự án](#cấu-trúc-dự-án)
10. [MongoDB Models](#mongodb-models)
11. [Quản lý tài sản IT — Excel Import/Export](#quản-lý-tài-sản-it--excel-importexport)
12. [Tech Stack](#tech-stack)
13. [Security](#security)
14. [Quy tắc phát triển](#quy-tắc-phát-triển)
15. [Troubleshooting](#troubleshooting)

---

## Tính năng chính

- **Quản lý ra/vào cổng (Gate Access)** — Tạo yêu cầu → Duyệt → Verify/Check-in/Check-out tại cổng
- **Quản lý tài sản IT** — Theo dõi máy tính, phần cứng, license OS/Office (mã hóa AES-256-CBC)
- **Quản lý phòng ban** — CRUD phòng ban, gán/gỡ nhân viên
- **Quản lý chức vụ** — Phân cấp 4 bậc: Manager > Assistant Manager > Supervisor > Staff
- **Quản lý người dùng** — Tạo/sửa/xóa user, gán role, quản lý profile
- **Báo cáo & xuất dữ liệu** — KPI realtime, báo cáo ngày, danh sách quá giờ, xuất Excel/CSV
- **Blacklist/Whitelist** — Chặn hoặc cho phép theo CCCD, SĐT, biển số xe
- **Thẻ cổng (Gate Card)** — Quản lý thẻ vật lý, gán/thu hồi khi check-in/check-out
- **Audit Log** — Ghi nhận mọi thao tác quan trọng

---

## Cài đặt và Chạy

### Yêu cầu

- Node.js v18+
- MongoDB (local hoặc Atlas)

### Cài đặt nhanh

```bash
npm run install:all
```

### Cấu hình Backend `.env`

```env
PORT=5001
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/elentec2
JWT_SECRET=your_super_secret_jwt_key
ENCRYPTION_KEY=your_32_character_encryption_key
CLIENT_URLS=http://localhost:5173,http://<LAN_IP>:5173
NODE_ENV=development
```

Frontend không cần `.env` khi chạy local — tự detect host hiện tại và gọi `http://<current-host>:5001/api`.

### Chạy dự án

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

### Truy cập LAN

- Backend `.env`: `HOST=0.0.0.0` và `CLIENT_URLS` chứa LAN origin
- Mở firewall cho port `5001` và `5173`
- Truy cập: `http://<LAN_IP>:5173`

---

## Tạo Admin đầu tiên

Vì hệ thống chỉ cho phép Admin tạo tài khoản mới, cần tạo admin đầu tiên qua MongoDB.

### Cách 1: MongoDB Shell

```bash
mongosh
use elentec2

# Password: admin123
db.users.insertOne({
  idCompanny: "admin",
  hashedPassword: "$2b$10$BzEGKxQQPxLq8HGz3QYaBuum4wNZYztXhOvNOdX5wZvQPVxFIz4Ci",
  email: "admin@example.com",
  displayName: "Admin",
  role: "admin",
  position: "Manager",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Login: `admin` / `admin123` — **đổi password ngay sau khi đăng nhập**.

### Cách 2: Tạo hash password tùy chọn

```javascript
// createHash.js
const bcrypt = require("bcrypt");
console.log(bcrypt.hashSync("your_password_here", 10));
```

```bash
node createHash.js
```

### Cách 3: Mở tạm route signup (dev only)

1. Đảm bảo `router.post("/signup", signUp)` tồn tại trong `backend/src/routes/authRoute.js`
2. Đăng ký tài khoản qua `/signup`
3. Vào MongoDB đổi `role: "admin"`

### Sau khi có Admin

1. Đăng nhập → `/admin`
2. Tạo users mới, gán role và chức vụ
3. Không share thông tin admin, luôn dùng password mạnh

---

## Quick Start — Test flow Gate Access

1. Login tài khoản `user` → tạo yêu cầu tại `/access/requests`
2. Login tài khoản `moderator/admin` → duyệt tại `/access/approvals`
3. Vào `/access/gate` → nhập `requestCode` → Verify → Check-in → Check-out
4. Test nhà thầu: chọn `Nhà thầu/đối tác thi công`, tick checklist an toàn
5. Test blacklist/whitelist: vào `/api/access-control/policies` (admin)

---

## Phân quyền

Hệ thống sử dụng **2 lớp phân quyền** song song:

### Role (vai trò hệ thống)

| Role          | Quyền                                                                |
| ------------- | -------------------------------------------------------------------- |
| **user**      | Xem profile, tạo yêu cầu ra/vào, quản lý thông tin cá nhân         |
| **moderator** | + Xem danh sách users, vận hành cổng, duyệt yêu cầu, xem báo cáo   |
| **admin**     | + Quản lý users/role, phòng ban, chức vụ, tài sản IT, access policy |

### Position (chức vụ — quyết định quyền nghiệp vụ)

| Level | Position          | Quyền bổ sung                                                |
| ----- | ----------------- | ------------------------------------------------------------ |
| 4     | Manager           | Quản lý chức vụ, xóa dữ liệu, import/export, sửa tài sản IT |
| 3     | Assistant Manager | Xem báo cáo, import/export, sửa tài sản IT                   |
| 2     | Supervisor        | Xem báo cáo, export dữ liệu                                  |
| 1     | Staff             | Chỉ xem thông tin cá nhân, tạo yêu cầu ra/vào                |

### Ma trận quyền theo Position

| Quyền              | Manager | Asst Manager | Supervisor | Staff |
| ------------------- | ------- | ------------ | ---------- | ----- |
| Quản lý users       | ✅       | ❌            | ❌          | ❌     |
| Quản lý chức vụ     | ✅       | ❌            | ❌          | ❌     |
| Xem báo cáo        | ✅       | ✅            | ✅          | ❌     |
| Xóa dữ liệu       | ✅       | ❌            | ❌          | ❌     |
| Export dữ liệu     | ✅       | ✅            | ✅          | ❌     |
| Import dữ liệu     | ✅       | ✅            | ❌          | ❌     |
| Sửa tài sản IT     | ✅       | ✅            | ❌          | ❌     |

### Middleware kiểm tra quyền

- `verifyToken` — Xác thực JWT, lấy position/department từ DB
- `isModerator` — role: moderator hoặc admin
- `isAdmin` — role: admin
- `isManager` — position level ≥ 4 hoặc role admin
- `isAssistantManagerOrAbove` — position level ≥ 3
- `isSupervisor` — position level ≥ 2
- `checkPosition(allowedPositions)` — danh sách position cụ thể
- `checkPositionLevel(minLevel)` — level tối thiểu

---

## Luồng nghiệp vụ Gate Access

### State Machine — Trạng thái yêu cầu

```
PENDING_APPROVAL → APPROVED → CHECKED_IN → CHECKED_OUT
                 → REJECTED
                 → CANCELLED
                                         → OVERDUE (quá giờ chưa check-out)
```

### Phân loại đối tượng (`subjectType`)

- `EMPLOYEE` — Nhân viên
- `GUEST` — Khách
- `CONTRACTOR` — Nhà thầu/đối tác thi công
- `VEHICLE` — Phương tiện

### Quy tắc nghiệp vụ

- Không cho check-in nếu chưa `APPROVED`
- Không cho check-out nếu chưa `CHECKED_IN` (hoặc `OVERDUE`)
- Mã QR hết hạn bị chặn
- Từ chối phê duyệt bắt buộc có lý do
- Manual deny phải lưu log để truy vết
- Check-in/check-out idempotent (gọi lặp trả thành công)
- Nhà thầu (`CONTRACTOR`) bắt buộc hoàn thành checklist an toàn trước duyệt
- Blacklist/whitelist kiểm tra khi tạo hồ sơ và tại cổng (verify/check-in)
- Các thao tác chính ghi `AuditLog`

### Phân quyền theo nhóm API

- **user**: tạo yêu cầu, xem yêu cầu của mình, hủy (nếu chưa vận hành cổng)
- **moderator/admin**: xem toàn bộ, duyệt/từ chối, vận hành cổng (verify/check-in/check-out/manual-deny)
- **admin**: quản trị policy chặn/cho phép theo ID/SĐT/biển số

### Field quan trọng trong VisitRequest

- `requestCode` — mã nghiệp vụ (vd: `REQ-20260308-1234`)
- `status` — trạng thái hiện tại
- `qrToken`, `qrExpiresAt` — xác minh tại cổng
- `approvedBy`, `approvedAt` — dấu vết phê duyệt
- `rejectedBy`, `rejectedAt`, `rejectionReason` — dấu vết từ chối
- `checkInAt`, `checkOutAt` — thời gian thực tế ra/vào
- `gateCardCode` — thẻ cổng được gán
- `portraitImageData` — ảnh chân dung khi check-in
- `companionVisitors`, `totalVisitors` — đăng ký nhiều người
- `safetyChecklistCompleted` — checklist an toàn cho nhà thầu

### Debug nhanh

1. Kiểm tra token và role trong middleware `verifyToken`
2. Kiểm tra trạng thái hiện tại trước khi gọi API chuyển trạng thái
3. Kiểm tra `requestCode`, `qrToken`, `idNumber` khi verify
4. Lỗi `403` → xác nhận tài khoản là `moderator` hoặc `admin`
5. Lỗi `404` → kiểm tra ObjectId hoặc mã nhập tại cổng

---

## Frontend Routes

| Route               | Trang                | Quyền                  |
| ------------------- | -------------------- | ---------------------- |
| `/`                 | Landing Page         | Public                 |
| `/login`            | Đăng nhập            | Public                 |
| `/signup`           | Đăng ký              | Public                 |
| `/dashboard`        | Dashboard            | Authenticated          |
| `/profile`          | Thông tin cá nhân    | Authenticated          |
| `/access/requests`  | Tạo yêu cầu ra/vào  | user, moderator, admin |
| `/access/approvals` | Duyệt yêu cầu       | moderator, admin       |
| `/access/gate`      | Vận hành cổng        | moderator, admin       |
| `/access/reports`   | Báo cáo ra/vào       | moderator, admin       |
| `/departments`      | Quản lý phòng ban    | moderator, admin       |
| `/it/computers`     | Quản lý tài sản IT   | admin                  |
| `/admin`            | Quản lý users & role | admin                  |
| `/admin/positions`  | Quản lý chức vụ      | admin                  |

---

## API Endpoints

### Auth (`/api/auth`)

```
POST   /signup                          # Đăng ký
POST   /signin                          # Đăng nhập
POST   /signout                         # Đăng xuất
GET    /profile                         # Xem profile
PUT    /profile                         # Cập nhật profile
POST   /change-password                 # Đổi mật khẩu
GET    /moderator/users                 # [moderator+] Danh sách users
GET    /moderator/users/:userId         # [moderator+] Chi tiết user
GET    /moderator/users/role/:role      # [moderator+] Lọc theo role
POST   /admin/assign-role               # [admin] Gán role
POST   /admin/remove-role               # [admin] Gỡ role
POST   /admin/create-user               # [admin] Tạo user
DELETE /admin/delete-user               # [admin] Xóa user
GET    /admin/all-users                 # [admin] Tất cả users
GET    /admin/users/:userId             # [admin] Chi tiết user
PUT    /admin/users/:userId             # [admin] Cập nhật user
GET    /admin/users/role/:role          # [admin] Lọc theo role
```

### Users (`/api/users`)

```
GET    /                                # Danh sách users
GET    /search                          # Tìm kiếm
GET    /position                        # Lọc theo chức vụ
GET    /department                      # Lọc theo phòng ban
GET    /:id                             # Chi tiết user
```

### Departments (`/api/departments`) — admin

```
GET    /                                # Danh sách phòng ban
POST   /                                # Tạo phòng ban
GET    /:id                             # Chi tiết
PUT    /:id                             # Cập nhật
DELETE /:id                             # Xóa
PATCH  /:id/toggle-status               # Bật/tắt trạng thái
GET    /:id/users                       # Nhân viên trong phòng
POST   /:id/users/add                   # Thêm nhân viên
POST   /:id/users/remove                # Gỡ nhân viên
```

### Positions (`/api/positions`)

```
GET    /hierarchy                       # Cây chức vụ
GET    /users                           # Users theo chức vụ
GET    /my-info                         # Thông tin chức vụ hiện tại
GET    /subordinates                    # Cấp dưới
GET    /statistics                      # [admin+] Thống kê
PUT    /:userId                         # [manager+] Cập nhật chức vụ
POST   /bulk-update                     # [admin] Cập nhật hàng loạt
```

### Computers (`/api/computers`) — IT/admin

```
GET    /                                # Danh sách tài sản
GET    /stats/by-dept                   # Thống kê theo phòng ban
GET    /search                          # Tìm kiếm
GET    /export                          # Xuất Excel
GET    /template                        # Tải template import
POST   /import                          # Import từ Excel
GET    /:id                             # Chi tiết
POST   /                                # Thêm mới
PUT    /:id                             # Cập nhật
DELETE /:id                             # Xóa
```

### Visits (`/api/visits`) — Tạo yêu cầu

```
GET    /                                # Danh sách yêu cầu
POST   /                                # Tạo yêu cầu
POST   /:id/cancel                      # Hủy yêu cầu
```

### Approvals (`/api/approvals`) — Duyệt yêu cầu

```
GET    /inbox                           # Inbox chờ duyệt
POST   /:requestId/approve              # Duyệt
POST   /:requestId/reject               # Từ chối
```

### Gate (`/api/gate`) — Vận hành cổng

```
POST   /verify-qr                       # Xác minh QR/mã yêu cầu
POST   /check-in                        # Check-in (gán thẻ cổng)
POST   /check-out                       # Check-out (thu hồi thẻ)
POST   /manual-deny                     # Từ chối thủ công
GET    /cards                           # Danh sách thẻ cổng
POST   /cards                           # Đăng ký thẻ mới
PATCH  /cards/toggle                    # Bật/tắt thẻ
```

### Reports (`/api/reports`) — moderator+

```
GET    /realtime                        # KPI realtime
GET    /daily?from=...&to=...           # Báo cáo ngày
GET    /overdue                         # Danh sách quá giờ
GET    /export?type=excel|csv           # Xuất báo cáo
```

### Access Policies (`/api/access-control`) — admin

```
GET    /policies                        # Danh sách blacklist/whitelist
POST   /policies                        # Tạo/cập nhật policy
PATCH  /policies/:id/toggle             # Bật/tắt policy
```

---

## Cấu trúc dự án

```
Elentec2/
├── package.json              # Root scripts (dev đồng thời backend + frontend)
├── backend/
│   ├── src/
│   │   ├── server.js         # Entry point
│   │   ├── controllers/      # Business logic (9 controllers)
│   │   ├── middlewares/       # Auth & permission middleware
│   │   ├── models/           # MongoDB schemas (8 models)
│   │   ├── routes/           # API routes (10 route files)
│   │   ├── libs/             # Database connection
│   │   └── utils/            # Encryption, position hierarchy, department membership
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Route definitions
│   │   ├── components/       # auth/, layout/, landing/, position/, ui/
│   │   ├── context/          # AuthContext (state management)
│   │   ├── hooks/            # useAuth, useForm, usePosition
│   │   ├── pages/
│   │   │   ├── Access/       # VisitRequestForm, ApprovalInbox, GateConsole, AccessReportPage
│   │   │   ├── Admin/        # AdminPanel
│   │   │   ├── Auth/         # Login, SignUp
│   │   │   ├── Dashboard/    # Dashboard
│   │   │   ├── Department/   # DepartmentPage
│   │   │   ├── IT/           # ComputerManagement
│   │   │   ├── LandingPage/  # LandingPage
│   │   │   ├── PositionManagement/
│   │   │   └── Profile/      # ProfilePage
│   │   └── utils/            # apiPaths, axiosInstance, constants
│   └── package.json
├── deploy/nginx/             # Cấu hình Nginx
└── SOP_Forms/                # Biểu mẫu SOP vận hành
```

---

## MongoDB Models

### User

| Field          | Type   | Ghi chú                                             |
| -------------- | ------ | --------------------------------------------------- |
| idCompanny     | String | Unique, mã nhân viên                                |
| hashedPassword | String | Bcrypt hash                                         |
| email          | String | Sparse unique                                       |
| displayName    | String | Bắt buộc                                            |
| department     | String | Phòng ban                                           |
| position       | String | Enum: Manager, Assistant Manager, Supervisor, Staff |
| role           | String | Enum: admin, moderator, user                        |
| phone          | String | Sparse unique                                       |

### Department

| Field       | Type       | Ghi chú           |
| ----------- | ---------- | ----------------- |
| name        | String     | Unique            |
| description | String     |                   |
| status      | String     | active / inactive |
| users       | [ObjectId] | Ref đến User      |

### VisitRequest

| Field                    | Type         | Ghi chú                                                                                   |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------------- |
| requestCode              | String       | Unique, vd: `REQ-20260308-1234`                                                           |
| visitorName              | String       | Tên khách                                                                                 |
| subjectType              | String       | EMPLOYEE / GUEST / CONTRACTOR / VEHICLE                                                   |
| status                   | String       | PENDING_APPROVAL / APPROVED / REJECTED / CHECKED_IN / CHECKED_OUT / OVERDUE / CANCELLED   |
| qrToken, qrExpiresAt     | String, Date | Mã QR xác minh tại cổng                                                                  |
| gateCardCode             | String       | Thẻ cổng được gán                                                                         |
| companionVisitors        | Array        | Danh sách người đi cùng                                                                   |
| safetyChecklistCompleted | Boolean      | Checklist an toàn (bắt buộc cho CONTRACTOR)                                               |
| portraitImageData        | String       | Ảnh chân dung khi check-in                                                                |

### ComputerInfo

| Field             | Type   | Ghi chú                                |
| ----------------- | ------ | -------------------------------------- |
| assetCode         | String | Unique, mã tài sản                    |
| employeeNo        | String | Mã nhân viên                          |
| computerName      | String | Tên máy                               |
| categories        | String | Desktop / Laptop / Workstation / Server |
| osKey, officeKey  | String | Mã hóa AES-256-CBC                    |
| installedSoftware | Array  | [{name, version, key}]                |

### GateCard

| Field         | Type     | Ghi chú                       |
| ------------- | -------- | ----------------------------- |
| cardCode      | String   | Unique, uppercase             |
| status        | String   | AVAILABLE / IN_USE / INACTIVE |
| assignedVisit | ObjectId | Ref đến VisitRequest          |

### AccessPolicyEntry

| Field  | Type    | Ghi chú                           |
| ------ | ------- | --------------------------------- |
| type   | String  | ID_NUMBER / PHONE / VEHICLE_PLATE |
| value  | String  | Giá trị cần chặn/cho phép        |
| policy | String  | BLOCK / ALLOW                     |
| active | Boolean | Compound index (type, value)      |

### AuditLog

| Field      | Type     | Ghi chú        |
| ---------- | -------- | -------------- |
| actorId    | ObjectId | Ref đến User   |
| actorRole  | String   |                |
| action     | String   | Hành động      |
| entityType | String   | Loại đối tượng |
| entityId   | String   |                |
| metadata   | Mixed    | Dữ liệu bổ sung |

### Session

| Field        | Type     | Ghi chú                         |
| ------------ | -------- | -------------------------------- |
| userId       | ObjectId | Ref đến User                    |
| refreshToken | String   | Unique                          |
| expiresAt    | Date     | TTL index (tự xóa khi hết hạn) |

---

## Quản lý tài sản IT — Excel Import/Export

### Cấu trúc file Excel (56 cột)

**Phần 1: Information (24 cột)** — STT, Asset Code, ID (mã NV), Full Name, Email, Phone, Position, Dept, IP Address, Mac Address, Computer Name, User Name Pc, Desktop/Laptop, Manufacturer, Model, Service Tag, CPU, RAM, HDD, SSD, VGA, Other, Status, Notes

**Phần 2: OS (4 cột)** — Version OS, OS License, OS Key (mã hóa), OS Note

**Phần 3: MS Office (4 cột)** — Version Office, MS License, Office Key (mã hóa), Office Note

**Phần 4: Software (24 cột = 6 phần mềm × 4 cột)** — AutoCAD, NX, PowerMill, Mastercam, ZWCAD, Symantec — mỗi phần mềm có: Version, License, Key (mã hóa), Note

### Quy tắc Import

- **Bắt buộc**: ID (mã NV), Full Name, Email, Dept, Computer Name
- **Product Keys**: tự động mã hóa AES-256 khi import
- **Mặc định**: Status = Active, Categories = Laptop (nếu để trống)
- **Hỗ trợ**: `.xlsx`, `.xls` — không xóa dòng header, không đổi tên cột

### Cách sử dụng

1. **Import**: Tải mẫu Excel → Điền dữ liệu → Upload qua giao diện → Hệ thống validate + mã hóa keys → Báo cáo kết quả
2. **Export**: Chọn filter (phòng ban, trạng thái) → Xuất Excel với full keys (chỉ admin)
3. **Template**: Tải file mẫu trống với 56 cột headers

---

## Tech Stack

### Frontend

| Package          | Version |
| ---------------- | ------- |
| React            | 19.2    |
| Vite             | 7.3     |
| React Router DOM | 7.13    |
| Tailwind CSS     | 4.1     |
| Axios            | 1.13    |
| Recharts         | 3.7     |
| Lucide React     | 0.574   |
| React Hot Toast  | 2.6     |

### Backend

| Package      | Version |
| ------------ | ------- |
| Express      | 5.2     |
| Mongoose     | 9.2     |
| jsonwebtoken | 9.0     |
| bcrypt       | 6.0     |
| ExcelJS      | 4.4     |
| multer       | 2.1     |
| dotenv       | 17.3    |

---

## Security

- Password hashing với bcrypt
- JWT Access Token (90 min) + Refresh Token (HTTP-only cookie)
- Session-based refresh tokens (MongoDB TTL auto-delete)
- CORS whitelist
- Mã hóa AES-256-CBC cho product keys (OS/Office)
- Role + Position middleware kết hợp
- Audit log cho thao tác quan trọng

---

## Quy tắc phát triển

### Trước khi code

1. Phải có mô tả yêu cầu rõ ràng (input, output, role nào dùng)
2. Phải xác định phạm vi: `backend`, `frontend`, hoặc cả hai
3. Phải liệt kê trạng thái nghiệp vụ bị ảnh hưởng
4. Không bắt đầu code nếu chưa rõ tiêu chí hoàn thành

### Backend

1. Mỗi endpoint mới phải có kiểm tra quyền (`verifyToken` + middleware role)
2. Mọi input phải validate đầy đủ, trả lỗi rõ ràng (`400/403/404/500`)
3. Không bỏ qua state machine: chỉ cho phép chuyển trạng thái hợp lệ
4. Thao tác nhạy cảm phải có audit log
5. Không hard-code dữ liệu bí mật trong source code

### Frontend

1. Không gọi API bằng URL cứng — dùng `API_PATHS`
2. Mọi thao tác API dùng `handleApiError` thống nhất
3. Màn hình nghiệp vụ phải có trạng thái `loading`, `empty`, `error`
4. Nút thao tác quan trọng phải enable/disable đúng trạng thái
5. Form validate client-side trước khi submit

### Dữ liệu

1. Thêm field model phải tương thích dữ liệu cũ
2. Không đổi tên field đang dùng nếu chưa cập nhật toàn bộ consumer
3. Thêm enum trạng thái mới phải cập nhật: backend validation + frontend mapping + báo cáo

### Bảo mật

1. Không log token/password/PII ra console production
2. Endpoint nội bộ phải giới hạn đúng role
3. Không merge code nếu còn đường bypass quyền tạm thời

### Review & Merge

1. PR phải mô tả rõ: vấn đề, giải pháp, files thay đổi, cách test
2. Không merge khi còn lỗi compile/lint
3. Không merge nếu chưa test end-to-end luồng chính
4. Không sửa file ngoài phạm vi nếu không có lý do

### Definition of Done

- [ ] Đúng yêu cầu nghiệp vụ và role sử dụng
- [ ] API/DB/UI nhất quán dữ liệu
- [ ] Kiểm tra quyền và validate input đầy đủ
- [ ] Có xử lý lỗi và thông báo dễ hiểu
- [ ] Build frontend pass, không có errors trong file đã sửa

---

## Troubleshooting

| Lỗi                    | Cách xử lý                                                 |
| ----------------------- | ----------------------------------------------------------- |
| MongoDB connection error | Kiểm tra `mongod` đang chạy và `MONGO_URI` trong `.env`   |
| CORS error              | Kiểm tra `CLIENT_URLS` chứa đúng origin frontend           |
| Token expired (401)     | Logout và login lại                                         |
| Kết nối LAN thất bại   | Mở firewall port `5001` + `5173`, kiểm tra `HOST=0.0.0.0`  |
| Role 403 bất ngờ        | Kiểm tra role trong DB + position level trong middleware   |
| QR hết hạn tại cổng     | Tạo yêu cầu mới hoặc gia hạn qua Approver                |
| Import Excel lỗi       | Kiểm tra file `.xlsx`, không xóa header, đúng cột bắt buộc |

---

## License

MIT
