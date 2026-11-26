npx --yes serve -l 5500
 PHÊ PHIM – HỆ THỐNG ĐẶT VÉ XEM PHIM TRỰC TUYẾN

## 1. Giới thiệu

**PHÊ PHIM** là hệ thống đặt vé xem phim trực tuyến được xây dựng nhằm hỗ trợ người dùng tra cứu phim, xem lịch chiếu, lựa chọn rạp, chọn ghế và thực hiện đặt vé.

Dự án áp dụng kiến trúc Client–Server, sử dụng Node.js và Express.js để xây dựng Backend API, PostgreSQL để quản lý dữ liệu, Redis để hỗ trợ lưu trữ và truy xuất dữ liệu tạm thời.

Hệ thống được triển khai trên môi trường Cloud với Frontend sử dụng Vercel, Backend sử dụng Render, cơ sở dữ liệu PostgreSQL sử dụng Neon và Redis sử dụng Upstash.

## 2. Mục tiêu dự án

- Xây dựng website đặt vé xem phim trực tuyến.
- Cung cấp thông tin phim, rạp chiếu và lịch chiếu.
- Hỗ trợ người dùng lựa chọn ghế và đặt vé.
- Quản lý dữ liệu phim, rạp, phòng chiếu, ghế và đơn đặt vé.
- Tìm hiểu kiến trúc Backend API và cơ sở dữ liệu quan hệ.
- Triển khai ứng dụng trên nền tảng Cloud.
- Tìm hiểu Docker, Redis và mô hình triển khai nhiều Backend Instance.

## 3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Hosting | Neon |
| Cache | Redis |
| Redis Hosting | Upstash |
| Containerization | Docker, Docker Compose |
| Web Server / Reverse Proxy | Nginx |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| Version Control | Git, GitHub |

## 4. Kiến trúc hệ thống

### 4.1. Kiến trúc tổng quan

Hệ thống được tổ chức theo mô hình Client–Server:

```text
                  USER
                    |
                    v
              FRONTEND
               (Vercel)
                    |
                    v
                REST API
                    |
                    v
              BACKEND SERVER
               (Render)
                    |
           +--------+--------+
           |                 |
           v                 v
       PostgreSQL           Redis
         (Neon)           (Upstash)
```

### 4.2. Môi trường triển khai Local

Trong môi trường phát triển và kiểm thử, hệ thống sử dụng Docker Compose để quản lý các dịch vụ.

```text
              USER
                |
                v
          NGINX :8088
                |
                v
          FRONTEND
                |
                v
          BACKEND API
          /         \
         v           v
    PostgreSQL     Redis
```
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