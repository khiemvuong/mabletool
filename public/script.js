// DOM Elements
const form = document.getElementById('automationForm');
const runNowBtn = document.getElementById('runNowBtn');
const statusCard = document.getElementById('statusCard');
const statusMessage = document.getElementById('statusMessage');
const tasksList = document.getElementById('tasksList');
const refreshTasksBtn = document.getElementById('refreshTasksBtn');
const toast = document.getElementById('toast');
const toggleAdvancedBtn = document.getElementById('toggleAdvanced');
const advancedOptions = document.getElementById('advancedOptions');
const advancedToggleIcon = document.getElementById('advancedToggleIcon');


// Generate unique task ID
function generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Show toast notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

// Show status message
function showStatus(message, success = true) {
    statusMessage.textContent = message;
    statusCard.classList.remove('hidden');
    
    if (!success) {
        statusCard.style.borderLeftColor = 'var(--danger)';
        statusMessage.style.background = 'rgba(239, 68, 68, 0.1)';
        statusMessage.style.color = 'var(--danger)';
    } else {
        statusCard.style.borderLeftColor = 'var(--success)';
        statusMessage.style.background = 'rgba(16, 185, 129, 0.1)';
        statusMessage.style.color = 'var(--success)';
    }
}

// Format time for display
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Load and display tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        
        if (data.success && data.tasks.length > 0) {
            tasksList.innerHTML = data.tasks.map(task => `
                <div class="task-item" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-title">🎯 ${task.searchKeyword}</div>
                        <button class="cancel-btn" onclick="cancelTask('${task.id}')">
                            ❌ Hủy
                        </button>
                    </div>
                    <div class="task-details">
                        <div class="task-detail">
                            <span>🌐</span>
                            <span class="task-url">${task.url}</span>
                        </div>
                        <div class="task-detail">
                            <span>⏰</span>
                            <span>Chạy lúc: ${formatTime(task.scheduledFor)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            tasksList.innerHTML = '<p class="empty-state">Chưa có task nào được hẹn giờ</p>';
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Không thể tải danh sách tasks!', 'error');
    }
}

// Cancel a task
async function cancelTask(taskId) {
    if (!confirm('Bạn có chắc muốn hủy task này?')) {
        return;
    }

    try {
        const response = await fetch('/api/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taskId })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, 'success');
            loadTasks(); // Refresh list
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error canceling task:', error);
        showToast('Không thể hủy task!', 'error');
    }
}

// Handle form submission (Schedule)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
        url: formData.get('url'),
        targetTime: formData.get('targetTime'),
        searchKeyword: formData.get('searchKeyword'),
        useOpera: document.getElementById('useOpera').checked,
        taskId: generateTaskId()
    };

    // Add advanced options if provided
    const searchSelector = document.getElementById('searchSelector')?.value?.trim() || '';
    const submitButtonText = document.getElementById('submitButtonText')?.value?.trim() || 'Submit';
    const skipRefresh = document.getElementById('skipRefresh')?.checked || false;

    if (searchSelector) data.searchSelector = searchSelector;
    if (submitButtonText) data.submitButtonText = submitButtonText;
    data.skipRefresh = skipRefresh;

    try {
        const response = await fetch('/api/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatus(result.message, true);
            showToast('✅ ' + result.message, 'success');
            form.reset();
            loadTasks(); // Refresh tasks list
        } else {
            showStatus(result.message, false);
            showToast('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error scheduling task:', error);
        showStatus('Có lỗi xảy ra khi hẹn giờ!', false);
        showToast('❌ Có lỗi xảy ra!', 'error');
    }
});

// Handle Run Now button
runNowBtn.addEventListener('click', async () => {
    const formData = new FormData(form);
    const data = {
        url: formData.get('url'),
        searchKeyword: formData.get('searchKeyword'),
        useOpera: document.getElementById('useOpera').checked
    };

    // Add advanced options if provided
    const searchSelector = document.getElementById('searchSelector')?.value?.trim() || '';
    const submitButtonText = document.getElementById('submitButtonText')?.value?.trim() || 'Submit';
    const skipRefresh = document.getElementById('skipRefresh')?.checked || false;

    if (searchSelector) data.searchSelector = searchSelector;
    if (submitButtonText) data.submitButtonText = submitButtonText;
    data.skipRefresh = skipRefresh;

    // Validate
    if (!data.url || !data.searchKeyword) {
        showToast('⚠️ Vui lòng điền đầy đủ URL và từ khóa!', 'error');
        return;
    }

    if (!confirm('Chạy automation ngay bây giờ?')) {
        return;
    }

    try {
        const response = await fetch('/api/run-now', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatus('🚀 Đang chạy automation... Browser sẽ mở trong giây lát!', true);
            showToast('🚀 Đang khởi động automation...', 'success');
        } else {
            showStatus(result.message, false);
            showToast('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error running automation:', error);
        showStatus('Có lỗi xảy ra!', false);
        showToast('❌ Có lỗi xảy ra!', 'error');
    }
});

// Handle Refresh Tasks button
refreshTasksBtn.addEventListener('click', () => {
    loadTasks();
    showToast('🔄 Đã làm mới danh sách tasks!', 'success');
});

// Handle Advanced Options Toggle
toggleAdvancedBtn.addEventListener('click', () => {
    const isHidden = advancedOptions.classList.contains('hidden');
    advancedOptions.classList.toggle('hidden');
    advancedToggleIcon.textContent = isHidden ? '▲' : '▼';
});

// Make cancelTask globally accessible
window.cancelTask = cancelTask;

// Load tasks on page load
loadTasks();

// Auto-refresh tasks every 10 seconds
setInterval(loadTasks, 10000);

