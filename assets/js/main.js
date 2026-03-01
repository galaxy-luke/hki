/**
 * 虹光 LIVE 網站核心邏輯
 * 0. 進站 Loading Overlay（白底 + Logo + 載入中文字，頁面載入完後淡出）
 * 1. 公告輪播 — 下進上出垂直切換
 *    可調整 NOTICE_INTERVAL 變更顯示秒數（預設 15 秒）
 */

/* ===================================
   進站 Loading Overlay
   =================================== */
/* ===================================
   進站 Loading Overlay 追蹤邏輯
   =================================== */
(function () {
    // 自定義資源追蹤：等待 DOM + 圖片，但排除字型 (fonts)
    document.addEventListener('DOMContentLoaded', function () {
        var images = document.querySelectorAll('img');
        var totalImages = images.length;
        var loadedCount = 0;
        var timeoutReached = false;

        function hideOverlay() {
            if (timeoutReached) return;
            timeoutReached = true;

            setTimeout(function () {
                var el = document.getElementById('loadingOverlay');
                if (!el) return;
                el.style.opacity = '0';
                setTimeout(function () {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }, 1000);
            }, 500);
        }

        // 安全機制：如果圖片太多或抓太久，5 秒後強制關閉 Loading
        var safetyTimeout = setTimeout(function () {
            hideOverlay();
        }, 5000);

        function checkDone() {
            loadedCount++;
            if (loadedCount >= totalImages) {
                clearTimeout(safetyTimeout);
                hideOverlay();
            }
        }

        if (totalImages === 0) {
            clearTimeout(safetyTimeout);
            hideOverlay();
        } else {
            images.forEach(function (img) {
                if (img.complete) {
                    checkDone();
                } else {
                    img.addEventListener('load', checkDone);
                    img.addEventListener('error', checkDone);
                }
            });
        }
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
            // 使用 offsetParent 判斷目前該元素是否正在顯示 (避開 display:none 報錯)
            var isVisible = mobileSwiperEl.offsetParent !== null;

            if (isVisible && !mobileAnnouncementSwiperInstance) {
                mobileAnnouncementSwiperInstance = new Swiper('.mobile-announcement-swiper', {
                    direction: 'vertical',
                    loop: finalSlideCount > 2,
                    autoplay: {
                        delay: 3000,
                        disableOnInteraction: false
                    }
                });
            } else if (!isVisible && mobileAnnouncementSwiperInstance) {
                mobileAnnouncementSwiperInstance.destroy(true, true);
                mobileAnnouncementSwiperInstance = null;
            }
        }

        handleMobileSwiperState();
        window.addEventListener('resize', handleMobileSwiperState);
    }
});