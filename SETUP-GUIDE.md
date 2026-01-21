# 🍁 Maple Auto Search Tool - Hướng Dẫn Setup

## 📋 Yêu cầu hệ thống

- **Windows 10/11** (khuyến nghị)
- **Node.js 18+** ([Tải tại đây](https://nodejs.org/))
- **Browser**: Opera / Chrome / Edge (ít nhất 1 trong 3)

## 🚀 Setup trên máy mới

### Bước 1: Cài đặt Node.js

1. Tải Node.js từ: https://nodejs.org/
2. Chạy file cài đặt và làm theo hướng dẫn
3. Khởi động lại Command Prompt/PowerShell

### Bước 2: Giải nén và cài dependencies

```bash
# Di chuyển vào thư mục dự án
cd d:\maple-tool

# Cài đặt dependencies
npm install

# (Tùy chọn) Cài Chrome cho Puppeteer nếu không có Chrome/Edge/Opera
npm run setup
```

### Bước 3: Chạy tool

```bash
npm start
```

Hoặc double-click vào file `start.bat`

Sau đó mở browser và truy cập: **http://localhost:3000**

## 🔧 Xử lý lỗi Browser

### ❌ Lỗi: "Could not find Chrome"

Tool cần ít nhất 1 trong 3 browser sau:

#### Giải pháp 1: Cài Chrome cho Puppeteer (Khuyến nghị)

```bash
npm run setup
```

Hoặc:

```bash
npx puppeteer browsers install chrome
```

#### Giải pháp 2: Cài Google Chrome

1. Tải Chrome từ: https://www.google.com/chrome/
2. Cài đặt bình thường
3. Tool sẽ tự động phát hiện

#### Giải pháp 3: Cài Opera (Có VPN tích hợp)

1. Tải Opera từ: https://www.opera.com/
2. Cài đặt bình thường
3. Tool sẽ tự động phát hiện

## 🎯 Thứ tự ưu tiên browser

Tool sẽ tự động tìm browser theo thứ tự:

1. **Opera** (nếu checkbox "Sử dụng Opera" được tích)
2. **Chrome/Edge** đã cài sẵn trên hệ thống
3. **Puppeteer bundled Chrome**

## 📦 Build file EXE (Portable)

Nếu muốn build thành file .exe để chạy trên máy khác không cần cài Node.js:

```bash
npm run build
```

File EXE sẽ được tạo tại: `dist/MapleAutoSearch.exe`

**Lưu ý**: File EXE vẫn cần Chrome/Edge/Opera đã cài sẵn để hoạt động!

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. Đảm bảo đã cài Node.js phiên bản 18 trở lên: `node -v`
2. Chạy `npm install` trong thư mục dự án
3. Kiểm tra có ít nhất 1 browser (Opera/Chrome/Edge) đã được cài đặt
4. Nếu vẫn lỗi, chạy: `npm run setup`

## 📝 Ghi chú

- **Port 3000** phải available (không bị process khác sử dụng)
- Tool chạy **local server**, không cần internet để hoạt động
- Automation sẽ **mở browser mới** khi chạy, đừng lo lắng!
