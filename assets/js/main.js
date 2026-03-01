/**
 * 虹光 LIVE 網站核心邏輯
 * 0. 進站 Loading Overlay（白底 + Logo + 載入中文字，頁面載入完後淡出）
 * 1. 公告輪播 — 下進上出垂直切換
 *    可調整 NOTICE_INTERVAL 變更顯示秒數（預設 15 秒）
 */

/* ===================================
   進站 Loading Overlay
   =================================== */
(function () {
    var ENABLE_LOADING_OVERLAY = true; // ← 設為 false 可關閉進站 Loading

    if (!ENABLE_LOADING_OVERLAY) return;
    // 動態建立 overlay DOM
    var overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML =
        '<style>' +
        '@keyframes hkiLoadingFade { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } } ' +
        '.loading-dot { animation: hkiLoadingFade 1.5s ease-in-out infinite; } ' +
        '#dot1 { animation-delay: -0.4s; } ' +
        '#dot2 { animation-delay: -0.2s; } ' +
        '#dot3 { animation-delay: 0s; }' +
        '</style>' +
        '<div style="display:flex;flex-direction:column;align-items:center;gap:20px;">' +
        '<img src="assets/images/common/logo.png" alt="虹光LIVE" style="width:120px;height:auto;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style="width:50px;height:50px;">' +
        '<rect id="dot1" class="loading-dot" fill="#b2b2b2c9" stroke="#9b9b9b" stroke-width="2" width="30" height="30" x="25" y="85"></rect>' +
        '<rect id="dot2" class="loading-dot" fill="#b2b2b2c9" stroke="#9b9b9b" stroke-width="2" width="30" height="30" x="85" y="85"></rect>' +
        '<rect id="dot3" class="loading-dot" fill="#b2b2b2c9" stroke="#9b9b9b" stroke-width="2" width="30" height="30" x="145" y="85"></rect>' +
        '</svg></div>';

    // Overlay 樣式
    overlay.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'background:#fff;display:flex;align-items:center;justify-content:center;' +
        'z-index:99999;transition:opacity 1s ease;opacity:1;';

    // 盡早插入 body（若 body 還未就緒，等 DOMContentLoaded）
    if (document.body) {
        document.body.appendChild(overlay);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.appendChild(overlay);
        });
    }

    // 頁面所有資源載入完成後，保留顯示 1 秒再淡出 1 秒
    window.addEventListener('load', function () {
        setTimeout(function () {
            var el = document.getElementById('loadingOverlay');
            if (!el) return;
            el.style.opacity = '0';
            setTimeout(function () {
                el.parentNode.removeChild(el);
            }, 1000); // 等淡出動畫 1 秒結束再移除
        }, 1000); // 載入完成後保留顯示 1 秒
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    var marquee = document.getElementById('announcementMarquee');
    if (!marquee) return;

    var items = marquee.querySelectorAll('.marquee-item');

    // 為每則公告加上點擊跳轉
    items.forEach(function (item) {
        item.addEventListener('click', function () {
            window.location.href = 'announcement.html';
        });
    });

    if (items.length <= 1) return;

    var currentIndex = 0;
    var NOTICE_INTERVAL = 15000; // ← 每則公告顯示時間（毫秒），預設 15 秒

    function switchNotice() {
        var current = items[currentIndex];

        // 目前這則：加 leaving（往上滑出），移除 active
        current.classList.add('leaving');
        current.classList.remove('active');

        // 下一則索引
        currentIndex = (currentIndex + 1) % items.length;

        // 短暫延遲後，讓下一則由下方滑入
        setTimeout(function () {
            // 清除前一則的 leaving
            current.classList.remove('leaving');

            // 新的一則加上 active（由下往上）
            items[currentIndex].classList.add('active');
        }, 500); // 等離場動畫完成再進場
    }

    setInterval(switchNotice, NOTICE_INTERVAL);

    // === 桌機版搜尋功能 ===
    var searchBtn = document.getElementById('searchBtn');
    var searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            var keyword = searchInput.value.trim();
            if (keyword) {
                window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
            } else {
                window.location.href = 'search.html';
            }
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // === 手機版搜尋功能 ===
    var mobileSearchBtn = document.getElementById('mobileSearchBtn');
    var mobileSearchInput = document.getElementById('mobileSearchInput');

    if (mobileSearchBtn && mobileSearchInput) {
        mobileSearchBtn.addEventListener('click', function () {
            var keyword = mobileSearchInput.value.trim();
            if (keyword) {
                window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
            } else {
                window.location.href = 'search.html';
            }
        });

        mobileSearchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                mobileSearchBtn.click();
            }
        });
    }

    // === 手機版置底推播 (Mobile Sticky Announcement) ===
    if (document.querySelector('.mobile-announcement-swiper')) {
        var mobileSwiperEl = document.querySelector('.mobile-announcement-swiper');
        var mobileSwiperWrapper = mobileSwiperEl.querySelector('.swiper-wrapper');
        var originalSlides = mobileSwiperWrapper.querySelectorAll('.swiper-slide');

        // Swiper loop 需要足夠的 DOM 節點，若只有 2 則公告易觸發警告，自動複製成 4 則
        if (originalSlides.length === 2) {
            originalSlides.forEach(function (slide) {
                mobileSwiperWrapper.appendChild(slide.cloneNode(true));
            });
        }

        // 取得所有 mobile announcement 連結（此時若被複製，會一併抓取）
        var mobileLinks = document.querySelectorAll('.mobile-announcement-text');

        // 存放原始文字的陣列
        var originalTexts = [];
        mobileLinks.forEach(function (link, index) {
            originalTexts[index] = link.textContent.trim();
        });

        function truncateMobileAnnouncements() {
            var containerWidth = window.innerWidth - 20; // 扣除左右 padding 各 10px

            // 建立一個隱藏的 span 來測量文字寬度
            var measureContext = document.createElement('span');
            measureContext.style.visibility = 'hidden';
            measureContext.style.position = 'absolute';
            measureContext.style.whiteSpace = 'nowrap';
            measureContext.style.fontSize = '16px';
            measureContext.style.fontFamily = "'Noto Sans TC', 'Microsoft JhengHei', serif";
            document.body.appendChild(measureContext);

            mobileLinks.forEach(function (link, index) {
                var fullText = originalTexts[index];
                measureContext.textContent = fullText;

                // 如果文字總寬度超過容器大小，就進行裁切
                if (measureContext.offsetWidth > containerWidth) {
                    var truncated = fullText;
                    // 逐步縮短文字直到加上 '...' 後寬度小於容器
                    while (truncated.length > 0) {
                        truncated = truncated.slice(0, -1);
                        measureContext.textContent = truncated + '...';
                        if (measureContext.offsetWidth <= containerWidth) {
                            break;
                        }
                    }
                    link.textContent = truncated + '...';
                } else {
                    // 若沒有超過就顯示原文字
                    link.textContent = fullText;
                }
            });

            document.body.removeChild(measureContext);
        }

        // 首次執行裁切與綁定 resize 事件
        truncateMobileAnnouncements();
        window.addEventListener('resize', truncateMobileAnnouncements);

        var finalSlideCount = mobileSwiperEl.querySelectorAll('.swiper-slide').length;
        var mobileAnnouncementSwiperInstance = null;

        function handleMobileSwiperState() {
            var isMobile = window.innerWidth < 992;
            if (isMobile && !mobileAnnouncementSwiperInstance) {
                mobileAnnouncementSwiperInstance = new Swiper('.mobile-announcement-swiper', {
                    direction: 'vertical',
                    loop: finalSlideCount > 2,
                    autoplay: {
                        delay: 3000,
                        disableOnInteraction: false
                    }
                });
            } else if (!isMobile && mobileAnnouncementSwiperInstance) {
                mobileAnnouncementSwiperInstance.destroy(true, true);
                mobileAnnouncementSwiperInstance = null;
            }
        }

        handleMobileSwiperState();
        window.addEventListener('resize', handleMobileSwiperState);
    }
});