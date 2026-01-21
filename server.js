const express = require("express");
const path = require("path");
const { runAutomation } = require("./automation");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Store scheduled tasks
const scheduledTasks = new Map();

// API endpoint to schedule automation
app.post("/api/schedule", async (req, res) => {
  try {
    const { url, targetTime, searchKeyword, taskId, searchSelector, submitButtonText, skipRefresh } = req.body;

    if (!url || !targetTime || !searchKeyword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    // Parse target time
    const [hours, minutes, seconds = "0"] = targetTime.split(":");
    const targetDate = new Date();
    targetDate.setHours(
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds),
      0,
    );

    // If time has passed today, schedule for tomorrow
    if (targetDate < new Date()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const delay = targetDate.getTime() - Date.now();

    // Schedule the task
    const timeoutId = setTimeout(async () => {
      console.log(`🚀 Bắt đầu automation cho task: ${taskId}`);
      await runAutomation(url, searchKeyword, { 
        useOpera: req.body.useOpera !== false,
        searchSelector,
        submitButtonText,
        skipRefresh
      });
      scheduledTasks.delete(taskId);
    }, delay);

    // Store the task
    scheduledTasks.set(taskId, {
      timeoutId,
      url,
      targetTime,
      searchKeyword,
      scheduledFor: targetDate.toISOString(),
    });

    res.json({
      success: true,
      message: `Đã hẹn giờ thành công! Sẽ chạy vào lúc ${targetDate.toLocaleString("vi-VN")}`,
      taskId,
      scheduledFor: targetDate.toISOString(),
      delayMs: delay,
    });
  } catch (error) {
    console.error("Error scheduling task:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// API endpoint to run immediately
app.post("/api/run-now", async (req, res) => {
  try {
    const { url, searchKeyword, searchSelector, submitButtonText, skipRefresh } = req.body;

    if (!url || !searchKeyword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    res.json({
      success: true,
      message: "Đang chạy automation...",
    });

    // Run in background
    runAutomation(url, searchKeyword, {
      useOpera: req.body.useOpera !== false,
      searchSelector,
      submitButtonText,
      skipRefresh
    }).catch(err => {
      console.error('Automation error:', err);
    });
  } catch (error) {
    console.error("Error running automation:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// API endpoint to cancel a scheduled task
app.post("/api/cancel", (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId || !scheduledTasks.has(taskId)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy task!",
      });
    }

    const task = scheduledTasks.get(taskId);
    clearTimeout(task.timeoutId);
    scheduledTasks.delete(taskId);

    res.json({
      success: true,
      message: "Đã hủy task thành công!",
    });
  } catch (error) {
    console.error("Error canceling task:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// API endpoint to get all scheduled tasks
app.get("/api/tasks", (req, res) => {
  const tasks = Array.from(scheduledTasks.entries()).map(([id, task]) => ({
    id,
    url: task.url,
    targetTime: task.targetTime,
    searchKeyword: task.searchKeyword,
    scheduledFor: task.scheduledFor,
  }));

  res.json({ success: true, tasks });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🍁 MAPLE AUTO SEARCH TOOL 🍁        ║
╚════════════════════════════════════════╝

✅ Server đang chạy tại: http://localhost:${PORT}
🌐 Mở trình duyệt và truy cập để sử dụng!

📋 Chức năng:
   - Hẹn giờ tự động search
   - Click vào kết quả đầu tiên
   - Xử lý trang web load chậm
   - Retry tự động khi lỗi

Press Ctrl+C to stop
  `);
});
