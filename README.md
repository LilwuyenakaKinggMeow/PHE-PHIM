Ngoài ra, dự án có cấu hình hai Backend Instance (`backend-a`, `backend-b`) để phục vụ việc thử nghiệm mô hình triển khai nhiều phiên bản Backend thông qua Nginx.

### 4.3. Môi trường Cloud

| Dịch vụ | Nền tảng |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| PostgreSQL | Neon |
| Redis | Upstash |
| Source Code | GitHub |

## 5. Chức năng hệ thống

### 5.1. Chức năng người dùng

- Xem danh sách phim đang được hiển thị.
- Xem thông tin chi tiết phim.
- Tìm kiếm và tra cứu phim.
- Xem danh sách rạp chiếu.
- Xem lịch chiếu theo phim và rạp.
- Lựa chọn suất chiếu.
- Xem sơ đồ ghế.
- Lựa chọn ghế ngồi.
- Thực hiện quy trình đặt vé.
- Theo dõi thông tin đặt vé.

### 5.2. Chức năng Backend

Backend cung cấp REST API để xử lý các yêu cầu từ Frontend:

- Quản lý thông tin phim.
- Quản lý rạp chiếu.
- Quản lý lịch chiếu.
- Quản lý ghế ngồi.
- Xử lý dữ liệu đặt vé.
- Kết nối và truy vấn PostgreSQL.
- Kết nối Redis.
- Cung cấp API kiểm tra trạng thái hoạt động.

### 5.3. Chức năng quản lý dữ liệu

Hệ thống sử dụng PostgreSQL để lưu trữ các dữ liệu chính:

- Movies: thông tin phim.
- Cinemas: thông tin rạp.
- Showtimes: lịch chiếu.
- Seats: thông tin ghế.
- Bookings: thông tin đặt vé.
- Booking Seats: thông tin ghế thuộc từng đơn đặt vé.

## 6. Cơ sở dữ liệu

Dự án sử dụng PostgreSQL làm hệ quản trị cơ sở dữ liệu quan hệ.

Các bảng chính:

| Bảng | Mô tả |
|---|---|
| movies | Lưu thông tin phim |
| cinemas | Lưu thông tin rạp chiếu |
| showtimes | Lưu lịch chiếu |
| seats | Lưu danh sách ghế |
| bookings | Lưu thông tin đặt vé |
| booking_seats | Liên kết đơn đặt vé với ghế |

Cơ sở dữ liệu được triển khai trên Neon để hỗ trợ truy cập từ Backend trong môi trường Cloud.

## 7. Redis và bộ nhớ đệm

Redis được sử dụng làm hệ thống lưu trữ dữ liệu tạm thời nhằm hỗ trợ tăng hiệu suất truy xuất dữ liệu.

Dự án kết nối Redis trong cả môi trường Local và Cloud:

- Local: Redis chạy thông qua Docker.
- Cloud: Redis được triển khai trên Upstash.

Việc sử dụng Redis giúp dự án tìm hiểu cách tích hợp một hệ thống cache bên cạnh cơ sở dữ liệu PostgreSQL.

## 8. Triển khai hệ thống

### 8.1. Triển khai Local bằng Docker

Yêu cầu:

- Node.js
- npm
- Docker Desktop
- Git

Các bước cơ bản:

1. Clone repository:

```bash
git clone https://github.com/LilwuyenakaKinggMeow/PHE-PHIM.git
```

2. Truy cập thư mục dự án:

```bash
cd PHE-PHIM
```

3. Cấu hình các biến môi trường theo file `.env.example` (nếu có).

4. Khởi chạy Docker Compose:

```bash
docker compose up -d --build
```
5. Kiểm tra các container:

```bash
docker compose ps
```

6. Truy cập giao diện:

```text
http://localhost:8088
```

### 8.2. Triển khai Cloud

Quy trình triển khai:

1. Đưa mã nguồn lên GitHub.
2. Kết nối repository với Vercel để triển khai Frontend.
3. Kết nối repository với Render để triển khai Backend.
4. Tạo PostgreSQL Database trên Neon.
5. Tạo Redis Database trên Upstash.
6. Cấu hình biến môi trường trên Render.
7. Cấu hình Frontend sử dụng API Backend.
8. Kiểm tra hoạt động của các API sau triển khai.

## 9. Kiểm tra hệ thống

Backend cung cấp API kiểm tra trạng thái hoạt động:

```http
GET /api/health
```

Địa chỉ Backend:

```text
https://phe-phim-backend.onrender.com
```

Một số API chính:

| API | Phương thức | Chức năng |
|---|---|---|
| `/api/health` | GET | Kiểm tra Backend |
| `/api/movies` | GET | Lấy danh sách phim |
| `/api/cinemas` | GET | Lấy danh sách rạp |
| `/api/showtimes` | GET | Lấy lịch chiếu |

## 10. Cấu trúc triển khai và quản lý mã nguồn

Repository GitHub:

https://github.com/LilwuyenakaKinggMeow/PHE-PHIM

Dự án được quản lý bằng Git và GitHub để theo dõi thay đổi mã nguồn, đồng bộ giữa môi trường phát triển và môi trường triển khai.

## 11. Hướng phát triển

Trong tương lai, hệ thống có thể được mở rộng theo các hướng:

- Hoàn thiện chức năng đăng nhập và phân quyền.
- Bổ sung giao diện quản trị.
- Tích hợp cổng thanh toán trực tuyến.
- Hoàn thiện quy trình đặt vé và xác nhận vé.
- Tối ưu truy vấn PostgreSQL.
- Tối ưu chiến lược Redis Cache.
- Tăng cường bảo mật API.
- Bổ sung kiểm thử tự động.
- Nâng cấp khả năng mở rộng và chịu tải.
- Xây dựng hệ thống giám sát hoạt động.

## 12. Tác giả

**Dự án:** PHÊ PHIM – Hệ thống đặt vé xem phim trực tuyến

**GitHub:** https://github.com/LilwuyenakaKinggMeow/PHE-PHIM

---

*PHÊ PHIM – Movie Ticket Booking System*