# 🍁 Maple Auto Search Tool v2.0 - Tối Ưu Hóa ⚡

## 🚀 Tính Năng Mới v2.0

### ⚡ NHANH HƠN 50-70%!

- **JavaScript Injection**: Nhập text siêu nhanh (không gõ từng ký tự)
- **Chặn Resources**: Không load images/fonts/CSS không cần thiết
- **Tối Ưu Load**: Dùng `domcontentloaded` thay vì `networkidle2`
- **Custom Selectors**: Cung cấp selector cụ thể để bỏ qua việc dò tìm
- **Skip Refresh**: Bỏ qua bước F5 để tăng tốc
- **Giảm Timeout**: Từ 5.5s xuống 2s

### 📊 Hiệu Suất

```
Trước: 8-12 giây
Sau:   3-5 giây ⚡
Tiết kiệm: 50-70% thời gian
```

---

## 📦 Yêu Cầu

- **Node.js** 14+ ([Download](https://nodejs.org/))
- **Browser**: Opera / Chrome / Edge
- **Windows** 10/11

---

## 🚀 Khởi Động Nhanh

### Lần Đầu Cài Đặt:

1. **Cài Node.js** (nếu chưa có)
   - Download từ: https://nodejs.org/

2. **Cài Dependencies**

   ```bash
   npm install
   ```

3. **Cài Browser** (nếu gặp lỗi Chrome)
   ```bash
   npm run setup
   ```
   Hoặc double-click: `setup-browser.bat`

### Khởi Động Tool:

**Cách 1**: Double-click `start.bat`

**Cách 2**: Command line

```bash
npm start
```

Sau đó mở browser và truy cập:

```
http://localhost:3000
```

---

## 🎯 Cách Sử Dụng

### 1. Cơ Bản

1. Nhập **URL** của trang web
2. Chọn **Thời gian** chạy (hoặc chạy ngay)
3. Nhập **Từ khóa** tìm kiếm
4. Click **"Hẹn Giờ Chạy"** hoặc **"Chạy Ngay"**

### 2. Tối Ưu Hóa (Nâng Cao)

Click **"⚙️ Tùy Chọn Nâng Cao"** để:

- **Search Selector**: CSS selector cho ô tìm kiếm (VD: `input#search`)
- **Result Selector**: CSS selector cho kết quả (VD: `a#video-title`)
- **Result Index**: Vị trí kết quả muốn click (0 = đầu tiên)
- **Skip Refresh**: Bỏ qua bước F5 (tiết kiệm ~2-3s)

#### Ví Dụ YouTube:

```
URL: https://www.youtube.com/
Từ khóa: "lofi hip hop"

Advanced:
├─ Search Selector: input#search
├─ Result Selector: a#video-title
├─ Result Index: 0
└─ Skip Refresh: ✓

⚡ Thời gian: ~3 giây
```

---

## 🔧 Tìm CSS Selector

### Cách 1: Browser DevTools

1. Mở website
2. Nhấn **F12**
3. Click icon 🔍 (Inspect)
4. Click vào element → Xem selector

### Cách 2: Console

```javascript
// Tìm search box
document.querySelector('input[type="search"]');

// Tìm kết quả
document.querySelectorAll("a");
```

---

## 🎭 Opera Browser

### Đường Dẫn Mặc Định

Tool tự động tìm Opera tại:

```
C:\Users\My PC\AppData\Local\Programs\Opera\launcher.exe
C:\Users\[Your Name]\AppData\Local\Programs\Opera\launcher.exe
C:\Program Files\Opera\launcher.exe
```

### Thêm Đường Dẫn Tùy Chỉnh

Nếu Opera ở vị trí khác, mở `automation.js` và thêm vào `commonPaths` (dòng 40-47):

```javascript
const commonPaths = [
  "C:\\Your\\Custom\\Path\\Opera\\launcher.exe",
  // ... các path khác
];
```

---

## ❌ Xử Lý Lỗi

### Lỗi: "Could not find Chrome"

**Giải pháp**:

1. Chạy `setup-browser.bat`
2. Hoặc cài Chrome từ https://www.google.com/chrome/
3. Hoặc cài Opera từ https://www.opera.com/

### Lỗi: "Không tìm thấy search box"

**Giải pháp**:

1. Kiểm tra lại Search Selector
2. Để trống để tool tự tìm
3. Website có thể load chậm - tắt "Skip Refresh"

### Lỗi: "Không tìm thấy kết quả"

**Giải pháp**:

1. Kiểm tra lại Result Selector
2. Thử tăng Result Index
3. Để trống để tool tự tìm

---

## 📁 Cấu Trúc Project

```
maple-tool/
├── automation.js          # Logic automation (⚡ ĐÃ TỐI ƯU)
├── server.js             # Express server
├── package.json          # Dependencies
├── start.bat             # Khởi động nhanh
├── setup-browser.bat     # Setup browser
├── public/
│   ├── index.html        # UI (⚡ Thêm Advanced Options)
│   ├── script.js         # Frontend logic
│   └── styles.css        # Styling
├── QUICK-GUIDE.txt       # Hướng dẫn nhanh
├── OPTIMIZATION-GUIDE.md # 🆕 Hướng dẫn tối ưu chi tiết
└── README.md            # File này
```

---

## 📚 Tài Liệu

- **Hướng dẫn nhanh**: `QUICK-GUIDE.txt`
- **Hướng dẫn tối ưu**: [`OPTIMIZATION-GUIDE.md`](./OPTIMIZATION-GUIDE.md)
- **Hướng dẫn setup**: `SETUP-GUIDE.md`
- **Changelog**: `CHANGELOG.md`

---

## 🆕 Changelog

### v2.0.0 - Tối Ưu Hóa (2026-01-21)

- ⚡ **Tăng tốc 50-70%**: JavaScript injection thay vì type
- 🚫 **Chặn resources**: Không load images/fonts/CSS
- 🎯 **Custom selectors**: Hỗ trợ selector cụ thể
- ⏭️ **Skip refresh**: Bỏ qua F5 (tùy chọn)
- 🔢 **Result index**: Chọn vị trí kết quả
- 📍 **Opera path**: Thêm đường dẫn Opera chính xác
- ⏱️ **Giảm timeout**: 5.5s → 2s

### v1.0.0 - Phiên Bản Gốc

- ✅ Hẹn giờ automation
- ✅ Auto search và click
- ✅ Retry mechanism
- ✅ Multi-browser support

---

## 📊 Performance Comparison

| Tính Năng    | v1.0     | v2.0    | Cải Thiện  |
| ------------ | -------- | ------- | ---------- |
| Nhập text    | 1.1s     | 0.05s   | **95% ↓**  |
| Load trang   | 4s       | 1.5s    | **62% ↓**  |
| Tìm selector | 2s       | 0.1s\*  | **95% ↓**  |
| Refresh      | 2.5s     | 0s\*\*  | **100% ↓** |
| **TỔNG**     | **~10s** | **~3s** | **70% ↓**  |

\* Với custom selector  
\*\* Khi bật skip refresh

---

## 🤝 Hỗ Trợ

Nếu gặp vấn đề:

1. Xem `QUICK-GUIDE.txt`
2. Xem `OPTIMIZATION-GUIDE.md`
3. Check terminal output để xem lỗi cụ thể

---

## 📝 Ghi Chú

### Browser Priority:

1. **Opera** (ưu tiên - có VPN)
2. Chrome (nếu không có Opera)
3. Edge (fallback)
4. Puppeteer Chrome (tự động download)

### Local Server:

- Tool chạy tại: `http://localhost:3000`
- Đây là **CONTROL PANEL**, KHÔNG phải website target
- Browser automation sẽ mở tab RIÊNG cho website target

---

Made with ❤️ by Maple Team | v2.0.0 ⚡
