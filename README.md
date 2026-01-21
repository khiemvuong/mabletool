# 🍁 Maple Auto Search Tool

Tool tự động search và click trên website theo lịch hẹn giờ.

## 🚀 Cài Đặt & Khởi Động

### Yêu cầu

- Node.js 14+ ([Download](https://nodejs.org/))
- Windows 10/11

### Cài đặt

```bash
npm install
```

### Khởi động

Double-click `start.bat` hoặc:

```bash
npm start
```

Mở browser: **http://localhost:3000**

---

## 🎯 Cách Sử Dụng

1. **URL**: Nhập URL trang web
2. **Thời gian**: Chọn thời gian chạy (hoặc "Chạy Ngay")
3. **Từ khóa**: Từ khóa cần tìm
4. **Submit Button Text**: Text của nút cần click (mặc định: "Submit")

### Tùy Chọn Nâng Cao

- **Search Selector**: CSS selector cho ô tìm kiếm
- **Skip Refresh**: Bỏ qua F5 để nhanh hơn

---

## 🔗 Sử Dụng Browser Đang Mở

Để tool dùng browser đang mở (giữ session đăng nhập):

### Bước 1: Mở browser với remote debugging

```bash
# Opera
"C:\Users\[Username]\AppData\Local\Programs\Opera\opera.exe" --remote-debugging-port=9222

# Chrome
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

Hoặc double-click: `setup-browser.bat`

### Bước 2: Navigate đến trang web target

### Bước 3: Chạy tool - nó sẽ tự kết nối và dùng tab hiện có

---

## ⚙️ Luồng Hoạt Động

```
BƯỚC 1: Kết nối Browser (hoặc mở mới)
    ↓
BƯỚC 2: Navigate + Refresh
    ↓
BƯỚC 3: Tìm Search Box
    ↓
BƯỚC 4: Lặp liên tục (30s timeout):
        ├─ Nhập keyword
        ├─ Nhấn Enter
        └─ Kiểm tra kết quả
    ↓
BƯỚC 5: Click nút Submit trong kết quả
```

---

## ❌ Xử Lý Lỗi

### "Could not find Chrome"

```bash
npm run setup
```

### "Không kết nối được browser"

Browser cần được mở với `--remote-debugging-port=9222`

### "Không tìm thấy search box"

- Kiểm tra Search Selector
- Tắt "Skip Refresh" nếu trang load chậm

---

## 📁 Cấu Trúc

```
maple-tool/
├── automation.js      # Logic automation
├── server.js          # Express server
├── start.bat          # Khởi động
├── setup-browser.bat  # Mở browser với debug
├── public/            # UI
└── test-page/         # Trang test
```

---

## 🆕 Phiên Bản

Xem chi tiết: [CHANGELOG.md](./CHANGELOG.md)

---

Made with ❤️ | v2.1
