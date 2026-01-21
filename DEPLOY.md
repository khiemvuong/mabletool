# 📦 Hướng Dẫn Deploy Maple Auto Search Tool

## Phương Án 1: Portable Executable (Khuyên Dùng) ⭐

### Bước 1: Build Executable

**Trên máy có Node.js (máy dev):**

```batch
build-portable.bat
```

Hoặc chạy thủ công:

```batch
npm install
npm install -g pkg
pkg . --targets node18-win-x64 --output dist/MapleAutoSearch.exe --compress GZip
xcopy /E /I /Y public dist\public
```

### Bước 2: Copy sang máy khác

Copy toàn bộ thư mục `dist` sang máy đích:

```
dist/
├── MapleAutoSearch.exe   <- File thực thi
└── public/               <- Giao diện web
    ├── index.html
    ├── styles.css
    └── script.js
```

### Bước 3: Chạy trên máy đích

1. **Mở `MapleAutoSearch.exe`** (double click hoặc click phải → Run as administrator)
2. **Mở trình duyệt** và truy cập: `http://localhost:3000`
3. **Sử dụng ngay!** ✨

> ⚠️ **Lưu ý**:
>
> - Windows Defender có thể cảnh báo vì file .exe mới. Chọn "More info" → "Run anyway"
> - Cần cài **Opera Browser** nếu muốn dùng VPN
> - Không cần cài Node.js hay bất kỳ thứ gì khác!

---

## Phương Án 2: Cài Node.js (Đơn giản)

### Trên máy đích:

1. **Tải và cài Node.js**: https://nodejs.org/en/download/
2. **Copy toàn bộ project folder** sang máy đích
3. **Mở Command Prompt** tại thư mục project
4. **Chạy các lệnh**:

```batch
npm install
npm start
```

5. **Mở trình duyệt**: `http://localhost:3000`

---

## Phương Án 3: USB Portable (Không cần cài gì)

### Chuẩn bị USB:

1. Tải **Portable Node.js**: https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x64.zip
2. Giải nén vào USB: `USB:\nodejs\`
3. Copy project vào USB: `USB:\maple-tool\`
4. Tạo file `start.bat` trong USB:

```batch
@echo off
cd /d "%~dp0maple-tool"
..\nodejs\node.exe server.js
pause
```

### Sử dụng:

1. Cắm USB vào máy bất kỳ
2. Chạy `start.bat`
3. Mở browser: `http://localhost:3000`

---

## 🔧 Troubleshooting

### Lỗi: Port 3000 đã được sử dụng

Mở `server.js`, sửa dòng:

```javascript
const PORT = 3000; // Đổi thành 3001, 3002, etc.
```

### Lỗi: Không tìm thấy Opera

- Đảm bảo Opera đã cài đặt
- Hoặc bỏ tick checkbox "Sử dụng Opera Browser"

### Lỗi: Windows Defender block

- Click "More info" → "Run anyway"
- Hoặc add exception trong Windows Security

---

## 📋 Checklist Deploy

- [ ] Build executable thành công
- [ ] Copy thư mục `dist` sang máy đích
- [ ] Cài Opera (nếu cần VPN)
- [ ] Test chạy file .exe
- [ ] Test mở http://localhost:3000
- [ ] Test chức năng search

---

## 🎁 Bonus: Tạo Desktop Shortcut

Sau khi copy `dist` folder vào máy đích (VD: `C:\MapleAutoSearch\`):

1. Click phải vào `MapleAutoSearch.exe`
2. Chọn "Create shortcut"
3. Kéo shortcut ra Desktop
4. Đổi tên thành "🍁 Maple Auto Search"

Xong! Giờ chỉ cần double-click icon trên Desktop là chạy! 🚀
