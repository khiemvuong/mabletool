const puppeteer = require('puppeteer');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Tìm Chrome/Edge đã cài sẵn trên Windows
 * @returns {string|null} - Đường dẫn đến Chrome/Edge executable
 */
function findChromePath() {
  const chromePaths = [
    // Chrome paths
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
    // Edge paths (Chromium-based)
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.PROGRAMFILES + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
  ];

  for (const path of chromePaths) {
    if (path && fs.existsSync(path)) {
      console.log(`✅ Tìm thấy browser tại: ${path}`);
      return path;
    }
  }

  return null;
}

/**
 * Tìm đường dẫn Opera browser
 * @returns {string|null} - Đường dẫn đến Opera executable
 */
function findOperaPath() {
  // Các đường dẫn phổ biến của Opera trên Windows
  const commonPaths = [
    // Đường dẫn CHÍNH XÁC của user (ưu tiên đầu tiên!)
    'C:\\Users\\My PC\\AppData\\Local\\Programs\\Opera\\opera.exe',
    
    // Các đường dẫn phổ biến khác với opera.exe
    process.env.LOCALAPPDATA + '\\Programs\\Opera\\opera.exe',
    'C:\\Program Files\\Opera\\opera.exe',
    'C:\\Program Files (x86)\\Opera\\opera.exe',
    
    // Thử với launcher.exe (một số phiên bản Opera dùng launcher)
    process.env.LOCALAPPDATA + '\\Programs\\Opera\\launcher.exe',
    'C:\\Program Files\\Opera\\launcher.exe',
    'C:\\Program Files (x86)\\Opera\\launcher.exe',
    
    // Opera GX
    process.env.LOCALAPPDATA + '\\Programs\\Opera GX\\opera.exe',
    'C:\\Program Files\\Opera GX\\opera.exe',
    process.env.LOCALAPPDATA + '\\Programs\\Opera GX\\launcher.exe',
    'C:\\Program Files\\Opera GX\\launcher.exe',
  ];

  for (const path of commonPaths) {
    if (fs.existsSync(path)) {
      console.log(`✅ Tìm thấy Opera tại: ${path}`);
      return path;
    }
  }

  console.log('⚠️ Không tìm thấy Opera');
  return null;
}

/**
 * Kiểm tra xem có browser đang chạy với remote debugging không
 * @param {number} port - Port của remote debugging (mặc định: 9222)
 * @returns {Promise<boolean>}
 */
async function checkBrowserRunning(port = 9222) {
  try {
    const response = await fetch(`http://localhost:${port}/json/version`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Connect tới browser đang chạy
 * @param {number} port - Port của remote debugging
 * @returns {Promise<Browser>}
 */
async function connectToExistingBrowser(port = 9222) {
  try {
    const browserURL = `http://localhost:${port}`;
    console.log(`🔗 Đang kết nối tới browser đang chạy tại port ${port}...`);
    const browser = await puppeteer.connect({ browserURL });
    console.log('✅ Đã kết nối thành công tới browser!');
    return browser;
  } catch (error) {
    console.error('❌ Không thể kết nối tới browser:', error.message);
    throw new Error('Không thể kết nối tới browser đang chạy. Vui lòng đảm bảo browser đã mở với remote debugging.');
  }
}

/**
 * Chạy automation: F5, search, và click vào kết quả đầu tiên
 * @param {string} url - URL của trang web
 * @param {string} searchKeyword - Từ khóa tìm kiếm
 * @param {object} options - Tùy chọn browser và các selector tùy chỉnh
 * @param {boolean} options.useExistingBrowser - Sử dụng browser đang mở (mặc định: true)
 * @param {number} options.debugPort - Port của remote debugging (mặc định: 9222)
 * @param {string} options.searchSelector - CSS Selector cụ thể cho ô tìm kiếm (tùy chọn)
 * @param {string} options.resultSelector - CSS Selector cụ thể cho kết quả đầu tiên (tùy chọn)
 * @param {number} options.resultIndex - Index của kết quả muốn click (mặc định: 0 = kết quả đầu tiên)
 * @param {boolean} options.skipRefresh - Bỏ qua bước refresh trang (nhanh hơn)
 * @param {boolean} options.useOpera - Ưu tiên sử dụng Opera browser
 */
async function runAutomation(url, searchKeyword, options = {}) {
  let browser;
  let shouldCloseBrowser = true; // Đóng browser khi xong nếu là browser mới
  const MAX_RETRIES = 3;
  const TIMEOUT = 30000; // 30 seconds
  const debugPort = options.debugPort || 9222;

  try {
    console.log('🌐 Đang khởi động browser...');
    
    // BƯỚC 1: Thử connect tới browser đang chạy (nếu user muốn)
    if (options.useExistingBrowser !== false) {
      console.log('🔍 Đang kiểm tra browser đang chạy...');
      
      try {
        // Thử connect tới browser với remote debugging
        browser = await connectToExistingBrowser(debugPort);
        shouldCloseBrowser = false; // KHÔNG đóng browser đang dùng
        console.log('✅ Sử dụng browser đang mở (tab mới sẽ được tạo)');
      } catch (error) {
        console.log('⚠️ Không tìm thấy browser đang chạy, sẽ mở browser mới...');
        console.log(`💡 Tip: Để dùng browser đang mở, khởi động Opera với: --remote-debugging-port=${debugPort}`);
      }
    }
    
    // BƯỚC 2: Nếu chưa có browser (hoặc connect thất bại), launch browser mới
    if (!browser) {
      // Cấu hình browser
      const launchOptions = {
        headless: false, // Hiển thị browser để user theo dõi
        defaultViewport: { width: 1280, height: 720 },
        args: [
          `--remote-debugging-port=${debugPort}`, // Enable remote debugging
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-web-security',
          '--disable-dev-shm-usage',
          '--fast-start', // Khởi động nhanh hơn
          '--disable-extensions-except', // Tắt extensions (nhanh hơn)
        ]
      };

      let browserFound = false;

      // Thử tìm Opera (nếu user muốn)
      if (options.useOpera !== false) {
        const operaPath = findOperaPath();
        if (operaPath) {
          launchOptions.executablePath = operaPath;
          console.log('🎭 Sử dụng Opera Browser (VPN sẽ hoạt động bình thường)');
          browserFound = true;
        }
      }

      // Bước 2: Nếu không tìm thấy Opera, thử tìm Chrome/Edge
      if (!browserFound) {
        const chromePath = findChromePath();
        if (chromePath) {
          launchOptions.executablePath = chromePath;
          console.log('🌐 Sử dụng Chrome/Edge đã cài sẵn');
          browserFound = true;
        }
      }

      // Bước 3: Nếu vẫn không tìm thấy, thử dùng Puppeteer bundled Chrome
      if (!browserFound) {
        console.log('⏳ Đang dùng Puppeteer bundled Chrome...');
        // Không set executablePath, để Puppeteer tự tìm
      }

      browser = await puppeteer.launch(launchOptions);
      shouldCloseBrowser = true; // Đóng browser khi xong vì đã launch mới
    }
    
    // Tạo page mới (hoặc dùng page hiện có)
    const page = await browser.newPage();


    // Set user agent để tránh bị detect bot
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set viewport lớn để tránh sidebar che nội dung
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    console.log('📐 Đã set viewport: 1920x1080');

    // Maximize window (nếu không phải headless)
    try {
      const session = await page.target().createCDPSession();
      const { windowId } = await session.send('Browser.getWindowForTarget');
      await session.send('Browser.setWindowBounds', {
        windowId,
        bounds: { windowState: 'maximized' }
      });
      console.log('🖥️ Đã maximize browser window');
    } catch (e) {
      console.log('⚠️ Không thể maximize window (có thể là headless mode)');
    }



    // Tối ưu hóa: Chặn các resource không cần thiết để load nhanh hơn
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // CHỈ chặn images và media (GIỮ LẠI stylesheet và font để trang hiển thị đúng)
      if (['image', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });


    // Bước 1: Navigate to URL
    console.log(`📍 Đang truy cập: ${url}`);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', // Thay 'networkidle2' bằng 'domcontentloaded' - nhanh hơn nhiều
      timeout: TIMEOUT 
    });

    // Đợi một chút để trang load (giảm từ 2000ms xuống 500ms)
    await page.waitForTimeout(500);

    // Bước 2: F5 (Refresh) - CÓ THỂ BỎ QUA nếu options.skipRefresh = true
    if (!options.skipRefresh) {
      console.log('🔄 Đang refresh trang...');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      await page.waitForTimeout(500);
    } else {
      console.log('⚡ Bỏ qua refresh để tăng tốc độ');
    }

    // Bước 3: Tìm search box và search
    console.log(`🔍 Đang tìm kiếm: "${searchKeyword}"`);
    
    let searchSuccess = false;
    
    // Nếu user cung cấp selector cụ thể, ưu tiên dùng nó
    const searchSelectors = options.searchSelector ? 
      [options.searchSelector] : // Dùng selector cụ thể nếu có
      [
        // Các selector phổ biến, sắp xếp theo độ ưu tiên
        'input[type="search"]',
        'input[name="search"]',
        'input[name="q"]',
        'input[placeholder*="search" i]',
        'input[placeholder*="tìm" i]',
        'input[aria-label*="search" i]',
        '#search',
        '#search-input',
        '.search-input',
        'input[type="text"]' // Fallback
      ];

    for (const selector of searchSelectors) {
      try {
        const searchBox = await page.$(selector);
        if (searchBox) {
          console.log(`✅ Tìm thấy search box: ${selector}`);
          
          // Click vào search box
          await searchBox.click();
          await page.waitForTimeout(200); // Giảm xuống 200ms
          
          // ⚡ TỐI ƯU: Dùng JavaScript để set value trực tiếp thay vì type()
          // Nhanh hơn NHIỀU so với việc gõ từng ký tự
          await page.evaluate((el, keyword) => {
            el.value = keyword;
            // Trigger input event để website nhận biết thay đổi
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, searchBox, searchKeyword);
          
          console.log('⚡ Đã nhập từ khóa (JavaScript injection - siêu nhanh!)');
          await page.waitForTimeout(300);
          
          // Nhấn Enter
          await searchBox.press('Enter');
          searchSuccess = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!searchSuccess) {
      throw new Error('Không tìm thấy search box trên trang!');
    }

    // Đợi kết quả search load
    console.log('⏳ Đang đợi kết quả search...');
    await page.waitForTimeout(2000); // Tăng lên 2s để chắc chắn

    // Bước 4: Tìm nút Submit và click
    const submitButtonText = options.submitButtonText || 'Submit';
    console.log(`🎯 Đang tìm nút có text "${submitButtonText}"...`);
    
    let clickSuccess = false;
    
    try {
      // Đợi button xuất hiện trước
      try {
        await page.waitForSelector('button', { timeout: 5000 });
        console.log('✅ Đã thấy button trên trang');
      } catch (e) {
        console.log('⚠️ Timeout đợi button, nhưng sẽ thử tiếp...');
      }
      
      // Đợi thêm một chút để page ổn định
      await page.waitForTimeout(500);
      
      // Lấy tất cả buttons
      const buttons = await page.$$('button, input[type="submit"], [role="button"], .btn, .btn-submit');
      console.log(`📋 Tìm thấy ${buttons.length} buttons trên trang`);
      
      if (buttons.length === 0) {
        throw new Error('Không tìm thấy button nào trên trang!');
      }
      
      // Loop qua từng button và tìm button có text phù hợp
      for (const btn of buttons) {
        try {
          const text = await page.evaluate(el => (el.textContent || el.value || '').trim(), btn);
          console.log(`   - Button: "${text}"`);
          
          if (text.toLowerCase().includes(submitButtonText.toLowerCase())) {
            console.log(`🔘 Tìm thấy nút: "${text}"`);
            
            // Scroll vào view
            await page.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), btn);
            await page.waitForTimeout(500);
            
            // Click
            await btn.click();
            console.log('✅ Đã click nút Submit!');
            clickSuccess = true;
            break;
          }
        } catch (btnErr) {
          console.log(`   ⚠️ Lỗi khi đọc button: ${btnErr.message}`);
          continue;
        }
      }
      
      // Fallback: click button đầu tiên nếu không tìm thấy text match
      if (!clickSuccess && buttons.length > 0) {
        console.log('⚠️ Không tìm thấy text match, click button đầu tiên...');
        await buttons[0].click();
        console.log('✅ Đã click button đầu tiên!');
        clickSuccess = true;
      }
    } catch (err) {
      console.error('❌ Lỗi khi tìm nút:', err.message);
    }

    if (!clickSuccess) {
      throw new Error('Không tìm thấy kết quả nào để click!');
    }

    console.log('✨ Hoàn thành! Đã click vào kết quả.');
    
    // Thông báo tùy theo loại browser
    if (shouldCloseBrowser) {
      console.log('🎬 Browser mới sẽ được giữ mở. Bạn có thể đóng bằng tay khi hoàn tất.');
    } else {
      console.log('✅ Tab automation hoàn thành! Browser đang chạy vẫn mở.');
      console.log('💡 Tip: Bạn có thể đóng tab này nếu muốn.');
    }


  } catch (error) {
    console.error('❌ Lỗi automation:', error.message);
    
    // Nếu lỗi liên quan đến không tìm thấy Chrome
    if (error.message.includes('Could not find Chrome') || error.message.includes('Could not find browser')) {
      console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ❌ KHÔNG TÌM THẤY BROWSER!                                    ║
╚════════════════════════════════════════════════════════════════╝

Vấn đề: Không tìm thấy Chrome/Edge/Opera trên máy này.

💡 GIẢI PHÁP (chọn 1 trong 3):

1️⃣ CÀI ĐẶT CHROME CHO PUPPETEER (Khuyến nghị):
   Mở Command Prompt/PowerShell trong thư mục dự án và chạy:
   
   npx puppeteer browsers install chrome
   
   Hoặc:
   
   npm install puppeteer --save
   npx puppeteer browsers install chrome

2️⃣ CÀI ĐẶT GOOGLE CHROME:
   Tải và cài đặt Chrome từ: https://www.google.com/chrome/
   Tool sẽ tự động phát hiện Chrome sau khi cài đặt.

3️⃣ CÀI ĐẶT OPERA BROWSER:
   Tải và cài đặt Opera từ: https://www.opera.com/
   Opera hỗ trợ VPN tích hợp sẵn.

Sau khi cài đặt, chạy lại automation.
      `);
    }
    
    // Chụp screenshot để debug (nếu browser đã mở)
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const timestamp = Date.now();
          await pages[0].screenshot({ 
            path: `error-${timestamp}.png`,
            fullPage: true 
          });
          console.log(`📸 Đã lưu screenshot lỗi: error-${timestamp}.png`);
        }
      } catch (screenshotErr) {
        console.error('Không thể chụp screenshot:', screenshotErr.message);
      }
    }

    throw error;
  }
}

module.exports = { runAutomation };
