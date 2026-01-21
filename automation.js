const puppeteer = require('puppeteer');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════
// CẤU HÌNH TIMEOUT VÀ RETRY
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  // Timeout tổng cho mỗi bước (ms) - trang chậm có thể cần tăng lên
  STEP_TIMEOUT: 60000,        // 60s cho mỗi bước chính
  
  // Khoảng cách giữa các lần retry (ms)
  RETRY_INTERVAL: 500,        // 0.5s
  
  // Thời gian đợi sau mỗi action (ms)
  ACTION_DELAY: 200,          // 0.2s
  
  // Không giới hạn số lần retry - chỉ dựa trên timeout
  // Công thức: số lần retry = STEP_TIMEOUT / RETRY_INTERVAL
};

/**
 * Helper: Đợi element xuất hiện với timeout
 * @param {Page} page - Puppeteer page
 * @param {string[]} selectors - Danh sách selector để thử
 * @param {number} timeout - Timeout (ms)
 * @returns {Promise<{element: ElementHandle, selector: string}>}
 */
async function waitForAnySelector(page, selectors, timeout = CONFIG.STEP_TIMEOUT) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          // Kiểm tra element có visible không
          const isVisible = await page.evaluate(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && 
                   rect.height > 0 && 
                   style.visibility !== 'hidden' && 
                   style.display !== 'none';
          }, element);
          
          if (isVisible) {
            return { element, selector };
          }
        }
      } catch (err) {
        // Ignore và thử selector tiếp
      }
    }
    
    // Đợi trước khi retry
    await page.waitForTimeout(CONFIG.RETRY_INTERVAL);
    
    // Log tiến trình mỗi 5s
    const elapsed = Date.now() - startTime;
    if (elapsed % 5000 < CONFIG.RETRY_INTERVAL) {
      console.log(`   ⏳ Đã đợi ${Math.round(elapsed/1000)}s...`);
    }
  }
  
  return { element: null, selector: null };
}

/**
 * Helper: Đợi cho đến khi tìm thấy kết quả phù hợp với keyword
 * @param {Page} page - Puppeteer page
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {string} submitButtonText - Text của nút submit
 * @param {number} timeout - Timeout (ms)
 * @returns {Promise<{found: boolean, element: ElementHandle|null}>}
 */
async function waitForResult(page, keyword, submitButtonText, timeout = CONFIG.STEP_TIMEOUT) {
  const startTime = Date.now();
  const keywordLower = keyword.toLowerCase();
  const submitTextLower = submitButtonText.toLowerCase();
  
  console.log(`🎯 Đang đợi kết quả chứa "${keyword}" hoặc nút "${submitButtonText}"...`);
  
  while (Date.now() - startTime < timeout) {
    try {
      // Thử tìm kết quả bằng JavaScript
      const result = await page.evaluate((kw, st) => {
        // Tìm tất cả card/item có thể là kết quả
        const cardSelectors = [
          '.card', '.item', '.result', '.product', 
          '[data-name]', '[class*="card"]', '[class*="item"]',
          'article', '.entry', '.post', '.listing'
        ];
        
        let allCards = [];
        cardSelectors.forEach(sel => {
          try {
            const cards = document.querySelectorAll(sel);
            cards.forEach(c => {
              if (!allCards.includes(c)) allCards.push(c);
            });
          } catch(e) {}
        });
        
        // Tìm card chứa keyword
        for (const card of allCards) {
          const text = (card.textContent || '').toLowerCase();
          const dataName = (card.dataset?.name || '').toLowerCase();
          
          if (text.includes(kw) || dataName.includes(kw)) {
            // Tìm nút trong card
            const btn = card.querySelector('button, .btn, [role="button"], input[type="submit"], a.btn');
            if (btn) {
              const rect = btn.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                return { 
                  found: true, 
                  method: 'card-button',
                  cardText: dataName || text.substring(0, 30)
                };
              }
            }
          }
        }
        
        // Tìm button có text match với submitButtonText
        const allButtons = document.querySelectorAll('button, .btn, .btn-submit, [role="button"]');
        for (const btn of allButtons) {
          const btnText = (btn.textContent || btn.value || '').toLowerCase().trim();
          if (btnText.includes(st)) {
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              return { found: true, method: 'submit-button', buttonText: btnText };
            }
          }
        }
        
        return { found: false };
      }, keywordLower, submitTextLower);
      
      if (result.found) {
        console.log(`✅ Tìm thấy kết quả! (${result.method})`);
        return { found: true };
      }
    } catch (err) {
      // Ignore và retry
    }
    
    await page.waitForTimeout(CONFIG.RETRY_INTERVAL);
    
    // Log tiến trình mỗi 5s
    const elapsed = Date.now() - startTime;
    if (elapsed % 5000 < CONFIG.RETRY_INTERVAL) {
      console.log(`   ⏳ Đang đợi kết quả... ${Math.round(elapsed/1000)}s`);
    }
  }
  
  return { found: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// BROWSER PATH FINDERS
// ═══════════════════════════════════════════════════════════════════════════

function findChromePath() {
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.PROGRAMFILES + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
  ];

  for (const path of chromePaths) {
    if (path && fs.existsSync(path)) {
      console.log(`✅ Tìm thấy browser: ${path}`);
      return path;
    }
  }
  return null;
}

function findOperaPath() {
  const commonPaths = [
    'C:\\Users\\My PC\\AppData\\Local\\Programs\\Opera\\opera.exe',
    process.env.LOCALAPPDATA + '\\Programs\\Opera\\opera.exe',
    'C:\\Program Files\\Opera\\opera.exe',
    'C:\\Program Files (x86)\\Opera\\opera.exe',
    process.env.LOCALAPPDATA + '\\Programs\\Opera\\launcher.exe',
    'C:\\Program Files\\Opera\\launcher.exe',
    process.env.LOCALAPPDATA + '\\Programs\\Opera GX\\opera.exe',
    'C:\\Program Files\\Opera GX\\opera.exe',
  ];

  for (const path of commonPaths) {
    if (fs.existsSync(path)) {
      console.log(`✅ Tìm thấy Opera: ${path}`);
      return path;
    }
  }
  return null;
}

async function connectToExistingBrowser(port = 9222) {
  try {
    const browserURL = `http://localhost:${port}`;
    console.log(`🔗 Đang kết nối tới browser port ${port}...`);
    const browser = await puppeteer.connect({ browserURL });
    console.log('✅ Đã kết nối thành công!');
    return browser;
  } catch (error) {
    throw new Error(`Không thể kết nối. Browser cần được mở với: --remote-debugging-port=${port}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN AUTOMATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Chạy automation với luồng xử lý TUẦN TỰ và ĐỢI CHO ĐẾN KHI THÀNH CÔNG
 * 
 * LUỒNG:
 * [1] Kết nối/Mở browser
 * [2] Tìm hoặc tạo tab → Navigate → Refresh
 * [3] Tìm search box (đợi đến khi xuất hiện)
 * [4] Nhập keyword + Submit (Enter hoặc button)
 * [5] Đợi kết quả xuất hiện (không có timeout cứng, đợi đến khi thấy)
 * [6] Click vào kết quả phù hợp
 */
async function runAutomation(url, searchKeyword, options = {}) {
  let browser;
  let shouldCloseBrowser = true;
  const debugPort = options.debugPort || 9222;
  const submitButtonText = options.submitButtonText || 'Submit';

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🍁 MAPLE AUTO SEARCH TOOL - STARTING                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`📌 URL: ${url}`);
  console.log(`📌 Keyword: ${searchKeyword}`);
  console.log(`📌 Submit Text: ${submitButtonText}`);
  console.log('');

  try {
    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 1: KẾT NỐI HOẶC MỞ BROWSER
    // ═══════════════════════════════════════════════════════════════
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 BƯỚC 1: Kết nối Browser');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (options.useExistingBrowser !== false) {
      try {
        browser = await connectToExistingBrowser(debugPort);
        shouldCloseBrowser = false;
      } catch (error) {
        console.log('⚠️ ' + error.message);
        console.log('→ Sẽ mở browser mới...');
      }
    }
    
    if (!browser) {
      const launchOptions = {
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
        args: [
          `--remote-debugging-port=${debugPort}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--fast-start',
        ]
      };

      // Tìm browser
      if (options.useOpera !== false) {
        const operaPath = findOperaPath();
        if (operaPath) {
          launchOptions.executablePath = operaPath;
        }
      }
      
      if (!launchOptions.executablePath) {
        const chromePath = findChromePath();
        if (chromePath) {
          launchOptions.executablePath = chromePath;
        }
      }

      browser = await puppeteer.launch(launchOptions);
      shouldCloseBrowser = true;
      console.log('✅ Đã mở browser mới');
    }

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 2: TÌM TAB HOẶC TẠO MỚI → NAVIGATE
    // ═══════════════════════════════════════════════════════════════
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 BƯỚC 2: Navigate đến URL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let page = null;
    let useExistingTab = false;
    
    if (!shouldCloseBrowser) {
      const pages = await browser.pages();
      const targetUrl = new URL(url);
      
      // Tìm tab đã mở URL tương tự
      for (const p of pages) {
        try {
          const pageUrl = p.url();
          if (pageUrl && pageUrl !== 'about:blank') {
            const currentUrl = new URL(pageUrl);
            if (currentUrl.origin === targetUrl.origin) {
              page = p;
              useExistingTab = true;
              console.log(`✅ Dùng tab hiện có: ${pageUrl}`);
              break;
            }
          }
        } catch (e) {}
      }
    }
    
    if (!page) {
      page = await browser.newPage();
      console.log('📄 Đã tạo tab mới');
    }

    // Cấu hình page
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1920, height: 1080 });

    // Maximize window
    try {
      const session = await page.target().createCDPSession();
      const { windowId } = await session.send('Browser.getWindowForTarget');
      await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'maximized' } });
    } catch (e) {}

    // Navigate hoặc Refresh
    if (useExistingTab) {
      if (!options.skipRefresh) {
        console.log('🔄 Refreshing...');
        await page.reload({ waitUntil: 'domcontentloaded', timeout: CONFIG.STEP_TIMEOUT });
      }
    } else {
      console.log(`🌐 Đang truy cập: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: CONFIG.STEP_TIMEOUT });
      
      if (!options.skipRefresh) {
        console.log('🔄 Refreshing...');
        await page.reload({ waitUntil: 'domcontentloaded', timeout: CONFIG.STEP_TIMEOUT });
      }
    }
    
    await page.waitForTimeout(CONFIG.ACTION_DELAY);
    console.log('✅ Trang đã load');

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 3: TÌM SEARCH BOX (ĐỢI CHO ĐẾN KHI XUẤT HIỆN)
    // ═══════════════════════════════════════════════════════════════
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 BƯỚC 3: Tìm Search Box');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const searchSelectors = options.searchSelector ? 
      [options.searchSelector] :
      [
        'input[placeholder="Search by name"]',
        'input[type="search"]',
        'input[name="search"]',
        'input[name="q"]',
        'input[placeholder*="search" i]',
        'input[placeholder*="tìm" i]',
        'input[aria-label*="search" i]',
        '#search',
        '#search-input',
        '#searchInput',
        '.search-input',
        'input[type="text"]'
      ];

    console.log('🔍 Đang tìm search box...');
    const { element: searchBox, selector: usedSelector } = await waitForAnySelector(page, searchSelectors);
    
    if (!searchBox) {
      throw new Error(`❌ Không tìm thấy search box sau ${CONFIG.STEP_TIMEOUT/1000}s!`);
    }
    
    console.log(`✅ Tìm thấy: ${usedSelector}`);

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 4: LẶP LIÊN TỤC: NHẬP → ENTER → KIỂM TRA KẾT QUẢ
    // Timeout sau 30s nếu không tìm thấy
    // ═══════════════════════════════════════════════════════════════
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 BƯỚC 4: Search và Tìm Kết Quả (Loop)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const SEARCH_TIMEOUT = 30000; // 30 giây
    const startTime = Date.now();
    let resultFound = false;
    let attemptCount = 0;
    
    const keywordLower = searchKeyword.toLowerCase();
    const submitTextLower = submitButtonText.toLowerCase();
    
    // Hàm kiểm tra nhanh xem có kết quả chưa
    async function checkForResult() {
      try {
        return await page.evaluate((kw, st) => {
          // Tìm card chứa keyword với button
          const cardSelectors = [
            '.card', '.item', '.result', '.product', 
            '[data-name]', '[class*="card"]', '[class*="item"]',
            'article', '.entry', '.post', '.listing'
          ];
          
          for (const sel of cardSelectors) {
            try {
              const cards = document.querySelectorAll(sel);
              for (const card of cards) {
                const text = (card.textContent || '').toLowerCase();
                const dataName = (card.dataset?.name || '').toLowerCase();
                
                if (text.includes(kw) || dataName.includes(kw)) {
                  const btn = card.querySelector('button, .btn, [role="button"], input[type="submit"]');
                  if (btn && btn.offsetParent !== null) {
                    return { found: true, type: 'card-button' };
                  }
                }
              }
            } catch(e) {}
          }
          
          // Tìm button có text match submitButtonText
          const buttons = document.querySelectorAll('button, .btn, .btn-submit, [role="button"]');
          for (const btn of buttons) {
            const btnText = (btn.textContent || btn.value || '').toLowerCase().trim();
            if (btnText.includes(st) && btn.offsetParent !== null) {
              return { found: true, type: 'submit-button' };
            }
          }
          
          return { found: false };
        }, kw, st);
      } catch (err) {
        return { found: false };
      }
    }
    
    // Vòng lặp chính: Nhập → Enter → Kiểm tra
    while (!resultFound && (Date.now() - startTime) < SEARCH_TIMEOUT) {
      attemptCount++;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`🔄 Lần ${attemptCount} (${elapsed}s)...`);
      
      // 1. Focus vào search box
      try {
        await searchBox.click();
      } catch (e) {
        // Thử tìm lại search box nếu bị stale
        const { element: newSearchBox } = await waitForAnySelector(page, searchSelectors, 2000);
        if (newSearchBox) {
          searchBox = newSearchBox;
          await searchBox.click();
        }
      }
      
      await page.waitForTimeout(100);
      
      // 2. Nhập keyword (siêu nhanh bằng JavaScript)
      await page.evaluate((el, keyword) => {
        el.value = '';
        el.value = keyword;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, searchBox, searchKeyword);
      
      console.log(`   ⚡ Nhập: "${searchKeyword}"`);
      
      // 3. Đợi một chút rồi Enter
      await page.waitForTimeout(300);
      await searchBox.press('Enter');
      console.log(`   ⏎ Enter`);
      
      // 4. Đợi một chút cho trang xử lý
      await page.waitForTimeout(500);
      
      // 5. Kiểm tra xem có kết quả chưa
      const check = await checkForResult();
      if (check.found) {
        console.log(`   ✅ Tìm thấy kết quả! (${check.type})`);
        resultFound = true;
        break;
      }
      
      console.log(`   ⏳ Chưa thấy kết quả, thử lại...`);
      
      // Đợi trước khi retry
      await page.waitForTimeout(500);
    }
    
    if (!resultFound) {
      console.log(`⚠️ Timeout ${SEARCH_TIMEOUT/1000}s - sẽ thử click anyway...`);
    }

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 5: CLICK VÀO KẾT QUẢ PHÙ HỢP
    // ═══════════════════════════════════════════════════════════════
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 BƯỚC 5: Click Kết Quả');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Sử dụng keywordLower và submitTextLower đã khai báo ở trên
    
    // Thực hiện click
    const clickResult = await page.evaluate((kw, st) => {
      // Tìm card chứa keyword
      const cardSelectors = [
        '.card', '.item', '.result', '.product', 
        '[data-name]', '[class*="card"]', '[class*="item"]',
        'article', '.entry', '.post', '.listing'
      ];
      
      let allCards = [];
      cardSelectors.forEach(sel => {
        try {
          document.querySelectorAll(sel).forEach(c => {
            if (!allCards.includes(c)) allCards.push(c);
          });
        } catch(e) {}
      });
      
      // Phương pháp 1: Card chứa keyword → click button trong đó
      for (const card of allCards) {
        const text = (card.textContent || '').toLowerCase();
        const dataName = (card.dataset?.name || '').toLowerCase();
        
        if (text.includes(kw) || dataName.includes(kw)) {
          const btn = card.querySelector('button, .btn, [role="button"], input[type="submit"], a.btn');
          if (btn) {
            btn.scrollIntoView({ behavior: 'instant', block: 'center' });
            btn.click();
            return { success: true, method: 'card-button', detail: dataName || text.substring(0, 30) };
          }
          
          // Card có thể click?
          if (card.tagName === 'A' || card.onclick) {
            card.click();
            return { success: true, method: 'card-click', detail: dataName };
          }
        }
      }
      
      // Phương pháp 2: Button có text match submitButtonText
      const buttons = document.querySelectorAll('button, .btn, .btn-submit, [role="button"]');
      for (const btn of buttons) {
        const btnText = (btn.textContent || btn.value || '').toLowerCase().trim();
        if (btnText.includes(st)) {
          btn.scrollIntoView({ behavior: 'instant', block: 'center' });
          btn.click();
          return { success: true, method: 'submit-button', detail: btnText };
        }
      }
      
      // Phương pháp 3: Link chứa keyword
      const links = document.querySelectorAll('a[href]');
      for (const link of links) {
        const text = (link.textContent || '').toLowerCase();
        if (text.includes(kw) && link.offsetParent !== null) {
          link.click();
          return { success: true, method: 'keyword-link', detail: text.substring(0, 30) };
        }
      }
      
      return { success: false };
    }, keywordLower, submitTextLower);
    
    if (clickResult.success) {
      console.log(`✅ Đã click thành công!`);
      console.log(`   → Phương pháp: ${clickResult.method}`);
      console.log(`   → Chi tiết: "${clickResult.detail}"`);
    } else {
      console.log('⚠️ Không tìm thấy kết quả phù hợp để click');
      console.log('💡 Tip: Kiểm tra lại keyword hoặc submitButtonText');
    }

    // ═══════════════════════════════════════════════════════════════
    // HOÀN THÀNH
    // ═══════════════════════════════════════════════════════════════
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ✨ AUTOMATION HOÀN THÀNH!                                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    
    if (!shouldCloseBrowser) {
      console.log('💡 Browser vẫn mở - tab automation đã hoàn thành');
    }

  } catch (error) {
    console.error('');
    console.error('╔══════════════════════════════════════════════════════════════╗');
    console.error('║  ❌ LỖI AUTOMATION                                           ║');
    console.error('╚══════════════════════════════════════════════════════════════╝');
    console.error('→', error.message);
    
    // Screenshot on error
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const timestamp = Date.now();
          await pages[pages.length - 1].screenshot({ 
            path: `error-${timestamp}.png`,
            fullPage: true 
          });
          console.log(`📸 Screenshot lỗi: error-${timestamp}.png`);
        }
      } catch (screenshotErr) {}
    }

    throw error;
  }
}

module.exports = { runAutomation };
