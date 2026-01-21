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
    'C:\\Program Files\\Opera\\launcher.exe',
    'C:\\Program Files (x86)\\Opera\\launcher.exe',
    process.env.LOCALAPPDATA + '\\Programs\\Opera\\launcher.exe',
    // Thêm đường dẫn chính xác của bạn
    'C:\\Users\\My PC\\AppData\\Local\\Programs\\Opera\\launcher.exe',
    // Opera GX
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
 * Chạy automation: F5, search, và click vào kết quả đầu tiên
 * @param {string} url - URL của trang web
 * @param {string} searchKeyword - Từ khóa tìm kiếm
 * @param {object} options - Tùy chọn browser và các selector tùy chỉnh
 * @param {string} options.searchSelector - CSS Selector cụ thể cho ô tìm kiếm (tùy chọn)
 * @param {string} options.resultSelector - CSS Selector cụ thể cho kết quả đầu tiên (tùy chọn)
 * @param {number} options.resultIndex - Index của kết quả muốn click (mặc định: 0 = kết quả đầu tiên)
 * @param {boolean} options.skipRefresh - Bỏ qua bước refresh trang (nhanh hơn)
 * @param {boolean} options.useOpera - Ưu tiên sử dụng Opera browser
 */
async function runAutomation(url, searchKeyword, options = {}) {
  let browser;
  const MAX_RETRIES = 3;
  const TIMEOUT = 30000; // 30 seconds

  try {
    console.log('🌐 Đang khởi động browser...');
    
    // Cấu hình browser
    const launchOptions = {
      headless: false, // Hiển thị browser để user theo dõi
      defaultViewport: { width: 1280, height: 720 },
      args: [
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

    // Bước 1: Thử tìm Opera (nếu user muốn)
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

    const page = await browser.newPage();

    // Set user agent để tránh bị detect bot
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Tối ưu hóa: Chặn các resource không cần thiết để load nhanh hơn
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Chặn images, fonts, stylesheets không quan trọng
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
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

    // Đợi kết quả search load (giảm từ 3000ms xuống 1500ms)
    console.log('⏳ Đang đợi kết quả search...');
    await page.waitForTimeout(1500);

    // Bước 4: Click vào kết quả
    console.log('🎯 Đang tìm kết quả...');
    
    let clickSuccess = false;
    const resultIndex = options.resultIndex || 0; // Mặc định click vào kết quả đầu tiên
    
    // Nếu user cung cấp selector cụ thể cho result, ưu tiên dùng nó
    const resultSelectors = options.resultSelector ?
      [options.resultSelector] : // Dùng selector cụ thể nếu có
      [
        // Các selector phổ biến, sắp xếp theo độ ưu tiên
        'a[href*="watch"]', // YouTube-like
        '.search-result a',
        '.result a',
        '[class*="result"] a',
        '[class*="item"] a',
        'article a',
        '.video-item a',
        '.content-item a',
        'main a', // Fallback
        'a' // Last resort - first link on page
      ];

    for (const selector of resultSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const results = await page.$$(selector);
        
        if (results && results.length > resultIndex) {
          console.log(`✅ Tìm thấy ${results.length} kết quả với selector: ${selector}`);
          
          // Click vào kết quả tại index chỉ định
          const targetResult = results[resultIndex];
          
          // Lấy href để verify
          const href = await page.evaluate(el => el.href, targetResult);
          console.log(`🔗 Click vào kết quả #${resultIndex + 1}: ${href}`);
          
          await targetResult.click();
          clickSuccess = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!clickSuccess) {
      // Fallback: click vào link đầu tiên trên trang
      console.log('⚠️ Không tìm thấy kết quả cụ thể, thử click link đầu tiên...');
      const allLinks = await page.$$('a[href]');
      if (allLinks.length > resultIndex) {
        await allLinks[resultIndex].click();
        clickSuccess = true;
      }
    }

    if (!clickSuccess) {
      throw new Error('Không tìm thấy kết quả nào để click!');
    }

    console.log('✨ Hoàn thành! Đã click vào kết quả.');
    
    // Giữ browser mở để user xem
    console.log('🎬 Browser sẽ được giữ mở. Bạn có thể đóng bằng tay khi hoàn tất.');

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
