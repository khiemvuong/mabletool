const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from test-page directory
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🧪 TEST PAGE SERVER - Maple Tool                            ║
╚════════════════════════════════════════════════════════════════╝

✅ Server đang chạy tại: http://localhost:${PORT}

📌 HƯỚNG DẪN TEST:
   1. Mở Maple Tool: http://localhost:3000
   2. Nhập URL: http://localhost:${PORT}
   3. Nhập từ khóa: "Golden Dragon", "Phoenix Rising", etc.
   4. Click "Chạy Ngay" và xem kết quả!

🎯 CÁC SLOT CÓ SẴN:
   • Golden Dragon
   • Phoenix Rising  
   • Crystal Palace
   • Thunder Strike
   • Ocean King
   • Lucky Star
   • Mystic Forest
   • Royal Crown

📋 ADVANCED OPTIONS (để test nhanh):
   • Search Selector: input[placeholder="Search by name"]
   • Card Selector: .slot-item
   • Submit Button: .btn-submit

Press Ctrl+C to stop
    `);
});
