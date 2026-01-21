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
 * Chạy automation: F5, search, và click vào kết quả
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. Mở/kết nối browser
 * 2. Navigate đến URL → Refresh (nếu cần)
 * 3. Tìm search box → Nhập keyword
 * 4. Submit search: Ưu tiên nút Submit bên cạnh search → Fallback Enter
 * 5. Tìm và click kết quả phù hợp với keyword
 * 
 * @param {string} url - URL của trang web
 * @param {string} searchKeyword - Từ khóa tìm kiếm
 * @param {object} options - Tùy chọn
 */
async function runAutomation(url, searchKeyword, options = {}) {
  let browser;
  let shouldCloseBrowser = true;
  const TIMEOUT = 30000;
  const debugPort = options.debugPort || 9222;

  try {
    console.log('🌐 Đang khởi động browser...');
    
    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 1: KẾT NỐI HOẶC MỞ BROWSER
    // ═══════════════════════════════════════════════════════════════
    if (options.useExistingBrowser !== false) {
      console.log('🔍 Đang kiểm tra browser đang chạy...');
      
      try {
        browser = await connectToExistingBrowser(debugPort);
        shouldCloseBrowser = false;
        console.log('✅ Sử dụng browser đang mở');
      } catch (error) {
        console.log('⚠️ Không tìm thấy browser đang chạy, sẽ mở browser mới...');
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
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-web-security',
          '--disable-dev-shm-usage',
          '--fast-start',
          '--disable-extensions-except',
        ]
      };

      let browserFound = false;

      if (options.useOpera !== false) {
        const operaPath = findOperaPath();
        if (operaPath) {
          launchOptions.executablePath = operaPath;
          console.log('🎭 Sử dụng Opera Browser');
          browserFound = true;
        }
      }

      if (!browserFound) {
        const chromePath = findChromePath();
        if (chromePath) {
          launchOptions.executablePath = chromePath;
          console.log('🌐 Sử dụng Chrome/Edge');
          browserFound = true;
        }
      }

      if (!browserFound) {
        console.log('⏳ Đang dùng Puppeteer bundled Chrome...');
      }

      browser = await puppeteer.launch(launchOptions);
      shouldCloseBrowser = true;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 1.5: TÌM TAB HIỆN TẠI HOẶC TẠO TAB MỚI
    // ═══════════════════════════════════════════════════════════════
    let page = null;
    let useExistingTab = false;
    
    // Nếu đang dùng browser hiện có, thử tìm tab đã mở URL
    if (!shouldCloseBrowser) {
      console.log('🔎 Đang tìm tab đã mở URL...');
      const pages = await browser.pages();
      
      // Parse URL để so sánh
      const targetUrl = new URL(url);
      const targetOrigin = targetUrl.origin;
      const targetPath = targetUrl.pathname;
      
      for (const p of pages) {
        try {
          const pageUrl = p.url();
          if (pageUrl && pageUrl !== 'about:blank') {
            const currentUrl = new URL(pageUrl);
            // So sánh origin và pathname (bỏ qua query string)
            if (currentUrl.origin === targetOrigin && 
                (currentUrl.pathname === targetPath || currentUrl.pathname.startsWith(targetPath))) {
              page = p;
              useExistingTab = true;
              console.log(`✅ Tìm thấy tab đang mở: ${pageUrl}`);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      // Fallback: Dùng tab đầu tiên không phải about:blank
      if (!page) {
        for (const p of pages) {
          if (p.url() !== 'about:blank') {
            page = p;
            console.log(`📑 Dùng tab hiện có: ${p.url()}`);
            break;
          }
        }
      }
    }
    
    // Nếu không tìm được tab phù hợp, tạo mới
    if (!page) {
      page = await browser.newPage();
      console.log('📄 Đã tạo tab mới');
    }

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    // Maximize window
    try {
      const session = await page.target().createCDPSession();
      const { windowId } = await session.send('Browser.getWindowForTarget');
      await session.send('Browser.setWindowBounds', {
        windowId,
        bounds: { windowState: 'maximized' }
      });
    } catch (e) {
      // Ignore
    }

    // Chặn images & media để tăng tốc (chỉ khi tab mới)
    if (!useExistingTab) {
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 2: NAVIGATE VÀ REFRESH
    // ═══════════════════════════════════════════════════════════════
    
    // Nếu đang dùng tab đã mở đúng URL → chỉ cần refresh (nhanh hơn!)
    if (useExistingTab) {
      console.log('⚡ Dùng tab hiện tại - chỉ cần refresh!');
      // Chỉ refresh, không navigate
      if (!options.skipRefresh) {
        console.log('🔄 Đang refresh trang...');
        await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        await page.waitForTimeout(300);
      }
    } else {
      // Tab mới → cần navigate
      console.log(`📍 Đang truy cập: ${url}`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUT 
      });
      await page.waitForTimeout(300);

      if (!options.skipRefresh) {
        console.log('🔄 Đang refresh trang...');
        await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        await page.waitForTimeout(300);
      } else {
        console.log('⚡ Bỏ qua refresh');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 3: TÌM VÀ NHẬP VÀO SEARCH BOX
    // ═══════════════════════════════════════════════════════════════
    console.log(`🔍 Đang tìm kiếm: "${searchKeyword}"`);
    
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

    let searchBox = null;
    let usedSelector = null;
    
    // Retry tìm search box
    const maxSearchRetries = 10;
    for (let attempt = 1; attempt <= maxSearchRetries && !searchBox; attempt++) {
      if (attempt > 1) {
        console.log(`🔄 Retry ${attempt}/${maxSearchRetries}...`);
        await page.waitForTimeout(500);
      }
      
      for (const selector of searchSelectors) {
        try {
          searchBox = await page.$(selector);
          if (searchBox) {
            usedSelector = selector;
            console.log(`✅ Tìm thấy search box: ${selector}`);
            break;
          }
        } catch (err) {
          continue;
        }
      }
    }

    if (!searchBox) {
      throw new Error('Không tìm thấy search box trên trang!');
    }

    // Click và nhập text siêu nhanh bằng JS
    await searchBox.click();
    await page.waitForTimeout(100);
    
    await page.evaluate((el, keyword) => {
      el.value = keyword;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, searchBox, searchKeyword);
    
    console.log('⚡ Đã nhập từ khóa siêu nhanh!');

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 4: SUBMIT SEARCH (TỐI ƯU THỨ TỰ ƯU TIÊN)
    // ═══════════════════════════════════════════════════════════════
    console.log('🚀 Đang submit search...');
    
    let searchSubmitted = false;
    const submitButtonText = options.submitButtonText || 'Submit';
    
    // CHIẾN LƯỢC SUBMIT TỐI ƯU:
    // 1. Tìm nút submit BÊN CẠNH search box (cùng form/container)
    // 2. Tìm nút submit type="submit" trong form
    // 3. Tìm nút search icon bên cạnh input
    // 4. Fallback: Nhấn Enter (hầu hết các page hiện đại đều hỗ trợ)
    
    // Thử Method 1: Tìm submit button trong cùng container
    try {
      const nearbySubmit = await page.evaluate((searchEl) => {
        // Tìm form chứa search input
        const form = searchEl.closest('form');
        if (form) {
          const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type="button"])');
          if (submitBtn) {
            submitBtn.click();
            return { clicked: true, method: 'form-submit' };
          }
        }
        
        // Tìm trong container cha (như .search-wrapper)
        const wrapper = searchEl.closest('.search-wrapper, .search-container, .search-box, .search-form, [class*="search"]');
        if (wrapper) {
          const wrapperBtn = wrapper.querySelector('button, [role="button"]');
          if (wrapperBtn) {
            wrapperBtn.click();
            return { clicked: true, method: 'wrapper-button' };
          }
        }
        
        // Tìm nút ngay sau input
        const nextSibling = searchEl.nextElementSibling;
        if (nextSibling && (nextSibling.tagName === 'BUTTON' || nextSibling.getAttribute('role') === 'button')) {
          nextSibling.click();
          return { clicked: true, method: 'adjacent-button' };
        }
        
        return { clicked: false };
      }, searchBox);
      
      if (nearbySubmit.clicked) {
        console.log(`✅ Đã click submit (${nearbySubmit.method})`);
        searchSubmitted = true;
      }
    } catch (err) {
      // Không tìm thấy, sẽ dùng Enter
    }
    
    // Fallback: Nhấn Enter (cách phổ biến nhất)
    if (!searchSubmitted) {
      console.log('⏎ Nhấn Enter để search...');
      await searchBox.press('Enter');
      searchSubmitted = true;
      console.log('✅ Đã nhấn Enter');
    }

    // Đợi kết quả load
    console.log('⏳ Đang đợi kết quả...');
    await page.waitForTimeout(1500);

    // ═══════════════════════════════════════════════════════════════
    // BƯỚC 5: TÌM VÀ CLICK KẾT QUẢ PHÙ HỢP
    // ═══════════════════════════════════════════════════════════════
    console.log(`🎯 Tìm kết quả chứa "${searchKeyword}" hoặc nút "${submitButtonText}"...`);
    
    let clickSuccess = false;
    const maxClickRetries = 5;
    const keywordLower = searchKeyword.toLowerCase();
    const submitTextLower = submitButtonText.toLowerCase();
    
    for (let attempt = 1; attempt <= maxClickRetries && !clickSuccess; attempt++) {
      if (attempt > 1) {
        console.log(`🔄 Retry click ${attempt}/${maxClickRetries}...`);
        await page.waitForTimeout(1000);
      }
      
      try {
        // PHƯƠNG PHÁP 1: Tìm card/item có chứa keyword VÀ có nút bấm
        const cardResult = await page.evaluate((keyword, submitText) => {
          const kw = keyword.toLowerCase();
          const st = submitText.toLowerCase();
          
          // Tìm tất cả các card/item có thể là kết quả
          const cardSelectors = [
            '.card', '.item', '.result', '.product', 
            '[data-name]', '[class*="card"]', '[class*="item"]', '[class*="result"]',
            'article', '.entry', '.post'
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
          
          // Lọc card có chứa keyword
          for (const card of allCards) {
            const text = (card.textContent || '').toLowerCase();
            const dataName = (card.dataset?.name || '').toLowerCase();
            
            if (text.includes(kw) || dataName.includes(kw)) {
              // Tìm nút trong card này
              const btn = card.querySelector('button, .btn, [role="button"], input[type="submit"]');
              if (btn) {
                // Scroll và click
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                btn.click();
                return { success: true, method: 'card-button', text: btn.textContent?.trim() };
              }
              
              // Nếu card có thể click được
              if (card.onclick || card.getAttribute('role') === 'button') {
                card.click();
                return { success: true, method: 'clickable-card', text: card.dataset?.name };
              }
            }
          }
          
          // PHƯƠNG PHÁP 2: Tìm button có text match với submitButtonText
          const allButtons = document.querySelectorAll('button, .btn, .btn-submit, [role="button"], input[type="submit"]');
          for (const btn of allButtons) {
            const btnText = (btn.textContent || btn.value || '').toLowerCase().trim();
            if (btnText.includes(st)) {
              btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
              btn.click();
              return { success: true, method: 'submit-text-match', text: btnText };
            }
          }
          
          // PHƯƠNG PHÁP 3: Tìm link/card có chứa keyword
          const links = document.querySelectorAll('a[href], [onclick]');
          for (const link of links) {
            const text = (link.textContent || '').toLowerCase();
            if (text.includes(kw)) {
              link.click();
              return { success: true, method: 'keyword-link', text: text.substring(0, 50) };
            }
          }
          
          return { success: false };
        }, searchKeyword, submitButtonText);
        
        if (cardResult.success) {
          console.log(`✅ Đã click: ${cardResult.method} - "${cardResult.text}"`);
          clickSuccess = true;
          break;
        }
        
        // PHƯƠNG PHÁP 4: Tìm bằng Puppeteer (chính xác hơn)
        if (!clickSuccess) {
          const buttons = await page.$$('button, .btn, .btn-submit, [role="button"]');
          console.log(`📋 Tìm thấy ${buttons.length} buttons`);
          
          for (const btn of buttons) {
            try {
              const btnInfo = await page.evaluate(el => ({
                text: (el.textContent || el.value || '').trim(),
                visible: el.offsetParent !== null,
                rect: el.getBoundingClientRect()
              }), btn);
              
              if (!btnInfo.visible || btnInfo.rect.width === 0) continue;
              
              console.log(`   - "${btnInfo.text}"`);
              
              if (btnInfo.text.toLowerCase().includes(submitTextLower) || 
                  btnInfo.text.toLowerCase().includes(keywordLower)) {
                await page.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), btn);
                await page.waitForTimeout(200);
                await btn.click();
                console.log(`✅ Đã click: "${btnInfo.text}"`);
                clickSuccess = true;
                break;
              }
            } catch (btnErr) {
              continue;
            }
          }
        }
        
      } catch (err) {
        console.error(`⚠️ Lỗi attempt ${attempt}:`, err.message);
      }
    }

    // Final status
    if (clickSuccess) {
      console.log('✨ Hoàn thành automation thành công!');
    } else {
      console.log('⚠️ Không tìm thấy kết quả phù hợp để click');
      console.log('💡 Tip: Kiểm tra lại keyword hoặc submitButtonText');
    }
    
    if (!shouldCloseBrowser) {
      console.log('✅ Tab automation hoàn thành! Browser vẫn mở.');
    }

  } catch (error) {
    console.error('❌ Lỗi automation:', error.message);
    
    if (error.message.includes('Could not find Chrome') || error.message.includes('Could not find browser')) {
      console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ❌ KHÔNG TÌM THẤY BROWSER!                                    ║
╚════════════════════════════════════════════════════════════════╝

💡 GIẢI PHÁP:
1️⃣ npx puppeteer browsers install chrome
2️⃣ Cài Chrome: https://www.google.com/chrome/
3️⃣ Cài Opera: https://www.opera.com/
      `);
    }
    
    // Screenshot on error
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const timestamp = Date.now();
          await pages[0].screenshot({ 
            path: `error-${timestamp}.png`,
            fullPage: true 
          });
          console.log(`📸 Screenshot: error-${timestamp}.png`);
        }
      } catch (screenshotErr) {}
    }

    throw error;
  }
}

module.exports = { runAutomation };
