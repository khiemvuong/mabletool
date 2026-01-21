# 🚀 Hướng Dẫn Tối Ưu Hóa Tốc Độ

## 📊 So Sánh Tốc Độ

### Trước Khi Tối Ưu:

- **Thời gian hoàn thành**: ~8-12 giây
- **Các bước**: Load trang → Refresh → Dò tìm search box → Gõ từng ký tự → Dò tìm kết quả → Click

### Sau Khi Tối Ưu:

- **Thời gian hoàn thành**: ~3-5 giây ⚡
- **Giảm**: 50-70% thời gian
- **Cải tiến**:
  - ✅ Dùng JavaScript injection thay vì gõ từng ký tự
  - ✅ Chặn tải images/fonts/CSS không cần thiết
  - ✅ Dùng `domcontentloaded` thay vì `networkidle2`
  - ✅ Giảm thời gian chờ từ 5500ms xuống 2000ms
  - ✅ Bỏ qua bước refresh (tùy chọn)
  - ✅ Dùng selector cụ thể thay vì dò tìm

---

## 🎯 Tính Năng Mới

### 1. **Nhập Nội Dung Siêu Nhanh** ⚡

**Cũ**: Dùng `page.type()` - gõ từng ký tự với delay 100ms

```javascript
await searchBox.type(searchKeyword, { delay: 100 });
// "hello world" = 11 ký tự × 100ms = 1100ms
```

**Mới**: Dùng JavaScript injection - set value trực tiếp

```javascript
await page.evaluate(
  (el, keyword) => {
    el.value = keyword;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  },
  searchBox,
  searchKeyword,
);
// Hoàn thành trong < 50ms
```

**Tiết kiệm**: ~1-2 giây cho mỗi lần nhập liệu

---

### 2. **Tối Ưu Tải Trang** 🌐

#### Chặn Resource Không Cần Thiết:

```javascript
await page.setRequestInterception(true);
page.on("request", (req) => {
  if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
    req.abort(); // Chặn images, fonts, CSS
  } else {
    req.continue();
  }
});
```

#### Đổi Strategy Load:

- **Cũ**: `waitUntil: 'networkidle2'` - Đợi tất cả network requests hoàn thành
- **Mới**: `waitUntil: 'domcontentloaded'` - Chỉ đợi DOM sẵn sàng

**Tiết kiệm**: ~2-3 giây mỗi lần load trang

---

### 3. **Custom Selectors** 🎯

Nếu bạn biết chính xác CSS selector của website, cung cấp nó để TĂNG TỐC ĐÁNG KỂ!

#### Ví Dụ với YouTube:

```
Search Selector: input#search
Result Selector: a#video-title
```

#### Ví Dụ với Google:

```
Search Selector: input[name="q"]
Result Selector: div.g a
```

#### Lợi ích:

- **Không cần dò tìm**: Bỏ qua việc thử 10 selectors khác nhau
- **Chính xác 100%**: Click đúng element mong muốn
- **Nhanh hơn 2-3 giây**

---

### 4. **Bỏ Qua Refresh** ⚡

Nếu website không yêu cầu refresh, bật tùy chọn này để tiết kiệm ~2-3 giây:

```
☑️ Bỏ qua bước Refresh trang (Tăng tốc ~2-3 giây)
```

**Khi nào nên BẬT**:

- ✅ Website đã load sẵn nội dung
- ✅ Không cần F5 để lấy dữ liệu mới
- ✅ Chạy nhiều lần liên tiếp trên cùng website

**Khi nào nên TẮT**:

- ❌ Website cần refresh để load nội dung mới
- ❌ Có cache cần clear
- ❌ Nội dung động thay đổi theo thời gian

---

### 5. **Chọn Vị Trí Kết Quả** 🔢

Mặc định, tool click vào **kết quả đầu tiên** (index = 0).

Bạn có thể thay đổi:

- `0` = Kết quả đầu tiên
- `1` = Kết quả thứ 2
- `2` = Kết quả thứ 3
- ...

---

## 🔧 Cách Sử Dụng

### Bước 1: Mở Advanced Options

1. Khởi động tool: `start.bat` hoặc `npm start`
2. Mở browser: `http://localhost:3000`
3. Click **"⚙️ Tùy Chọn Nâng Cao (Tăng Tốc Độ)"**

### Bước 2: Tìm CSS Selectors (Tùy chọn)

#### Cách 1: Dùng Browser DevTools

1. Truy cập website target
2. Nhấn F12 để mở DevTools
3. Click vào icon 🔍 (Inspect Element)
4. Click vào ô search → Xem selector trong DevTools

#### Cách 2: Dùng Console

```javascript
// Tìm search box
document.querySelector('input[type="search"]');

// Tìm kết quả
document.querySelectorAll("a");
```

### Bước 3: Điền Thông Tin

```
URL: https://www.youtube.com/
Từ Khóa: "your search keyword"

=== ADVANCED OPTIONS ===
Search Selector: input#search    (Tùy chọn)
Result Selector: a#video-title   (Tùy chọn)
Result Index: 0                   (Mặc định)
☑️ Bỏ qua Refresh                (Nếu muốn)
```

### Bước 4: Chạy

- **Hẹn giờ**: Click "Hẹn Giờ Chạy"
- **Ngay lập tức**: Click "Chạy Ngay"

---

## 📈 Kịch Bản Thực Tế

### YouTube - Tìm Và Click Video

```
URL: https://www.youtube.com/
Từ khóa: "lofi hip hop"

Advanced Options:
├─ Search Selector: input#search
├─ Result Selector: a#video-title
├─ Result Index: 0 (video đầu tiên)
└─ Skip Refresh: ✓ (Bật)

Thời gian: ~3 giây ⚡
```

### Google - Tìm Kiếm

```
URL: https://www.google.com/
Từ khóa: "puppeteer tutorial"

Advanced Options:
├─ Search Selector: input[name="q"]
├─ Result Selector: div.g a h3
├─ Result Index: 0
└─ Skip Refresh: ✓ (Bật)

Thời gian: ~2.5 giây ⚡
```

### Website Tùy Chỉnh

```
URL: https://example.com/
Từ khóa: "product name"

Advanced Options:
(Để trống nếu không biết selectors)

Thời gian: ~5-7 giây
```

---

## ⚠️ Lưu Ý Quan Trọng

### Opera Browser - Đường Dẫn Chính Xác

Tool đã được cập nhật để tìm Opera tại:

```
C:\Users\My PC\AppData\Local\Programs\Opera\launcher.exe
```

Nếu Opera của bạn ở vị trí khác, mở `automation.js` và thêm đường dẫn vào mảng `commonPaths` (dòng 40-47).

### Khi Nào KHÔNG Nên Dùng Custom Selectors

- ❌ Website có cấu trúc thay đổi thường xuyên
- ❌ Selector quá phức tạp
- ❌ Bạn không chắc chắn về selector

➡️ **Trong trường hợp này, để trống** - tool sẽ tự động dò tìm!

### Troubleshooting

#### Lỗi: "Không tìm thấy search box"

**Giải pháp**:

1. Kiểm tra lại selector
2. Đợi thêm thời gian để trang load (giảm tốc độ tối ưu)
3. Để trống selector và để tool tự tìm

#### Lỗi: "Không tìm thấy kết quả"

**Giải pháp**:

1. Kiểm tra lại result selector
2. Thử tăng Result Index (có thể kết quả đầu tiên là quảng cáo)
3. Để trống selector và để tool tự tìm

---

## 🎯 Tóm Tắt Tối Ưu

| Tính Năng            | Tiết Kiệm | Cách Sử Dụng  |
| -------------------- | --------- | ------------- |
| JavaScript Injection | ~1-2s     | Tự động       |
| Chặn Resources       | ~2-3s     | Tự động       |
| domcontentloaded     | ~2-3s     | Tự động       |
| Custom Selectors     | ~2-3s     | Điền vào form |
| Skip Refresh         | ~2-3s     | Tick checkbox |
| Giảm Timeout         | ~1.5s     | Tự động       |

**TỔNG TIẾT KIỆM**: 5-7 giây mỗi lần chạy! 🚀

---

## 📝 Changelog

### v2.0.0 - Tối Ưu Hóa

- ✅ Thêm JavaScript injection để nhập text siêu nhanh
- ✅ Chặn images/fonts/CSS không cần thiết
- ✅ Đổi load strategy sang `domcontentloaded`
- ✅ Thêm support cho custom selectors
- ✅ Thêm tùy chọn bỏ qua refresh
- ✅ Thêm tùy chọn chọn result index
- ✅ Giảm timeout từ 5500ms → 2000ms
- ✅ Thêm đường dẫn Opera chính xác

### v1.0.0 - Phiên Bản Gốc

- ✅ Hẹn giờ automation
- ✅ Auto search và click
- ✅ Retry mechanism
- ✅ Multi-browser support

---

Made with ⚡ by Maple Team
