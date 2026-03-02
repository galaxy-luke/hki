/**
 * 虹光 LIVE 網站核心邏輯
 * 0. 進站 Loading Overlay（白底 + Logo + 載入中文字，頁面載入完後淡出）
 * 1. 公告輪播 — 下進上出垂直切換
 *    可調整 NOTICE_INTERVAL 變更顯示秒數（預設 8 秒）
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
    var NOTICE_INTERVAL = 8000; // ← 每則公告顯示時間（毫秒），預設 8 秒

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
        var swiperContainer = document.querySelector('.mobile-announcement-swiper');
        var originalLinks = swiperContainer.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) .mobile-announcement-text');

        // 如果沒有抓到（可能因為先前腳本修改過 DOM），則嘗試抓取所有
        if (originalLinks.length === 0) {
            originalLinks = swiperContainer.querySelectorAll('.mobile-announcement-text');
        }

        // 取出所有連結資料
        var linkData = [];
        var seenTexts = new Set();
        originalLinks.forEach(function (link) {
            var text = link.innerHTML.trim();
            // 避免因為 swiper duplicate 抓到重複的內容
            if (!seenTexts.has(text)) {
                seenTexts.add(text);
                linkData.push({
                    text: text,
                    href: link.getAttribute('href') || '#'
                });
            }
        });

        // 清空容器，改為純跑馬燈結構
        swiperContainer.innerHTML = '';

        var marqueeWrap = document.createElement('div');
        marqueeWrap.style.width = '100%';
        marqueeWrap.style.height = '100%';
        marqueeWrap.style.overflow = 'hidden';
        marqueeWrap.style.position = 'relative';
        marqueeWrap.style.display = 'flex';
        marqueeWrap.style.alignItems = 'center';

        var marqueeTrack = document.createElement('div');
        marqueeTrack.style.display = 'flex';
        marqueeTrack.style.alignItems = 'center';
        marqueeTrack.style.height = '100%';
        marqueeTrack.style.whiteSpace = 'nowrap';

        marqueeWrap.appendChild(marqueeTrack);
        swiperContainer.appendChild(marqueeWrap);

        var currentMarqueeAnim = null;

        function buildMarquee() {
            marqueeTrack.innerHTML = '';
            var containerWidth = marqueeWrap.offsetWidth;
            if (containerWidth === 0) return;

            // 使用者需求: 上一則跑完 1/3 後下一則進入，代表間距約為螢幕寬度的 2/3
            var gapSpacing = Math.floor(containerWidth * 2 / 3);
            if (gapSpacing < 20) gapSpacing = 20;

            // 建立一組完整的公告群組
            function createGroup() {
                var group = document.createElement('div');
                group.style.display = 'flex';
                group.style.alignItems = 'center';
                linkData.forEach(function (data) {
                    var a = document.createElement('a');
                    a.href = data.href;
                    a.innerHTML = data.text;
                    // 保留原本 class 的視覺設定
                    a.className = 'mobile-announcement-text text-decoration-none';
                    a.style.display = 'inline-block';
                    a.style.paddingRight = gapSpacing + 'px';
                    a.style.whiteSpace = 'nowrap';
                    a.style.color = '#000';
                    a.style.fontSize = '16px';
                    // 覆蓋 padding 防止 base.css 的干擾，確保右方 padding 就是我們的 gapSpacing
                    a.style.paddingLeft = '0px';
                    group.appendChild(a);
                });
                return group;
            }

            var group1 = createGroup();
            marqueeTrack.appendChild(group1);

            var groupWidth = group1.offsetWidth;
            if (groupWidth === 0) {
                // 如果因為 display none 導致無寬度，延後重試
                setTimeout(buildMarquee, 500);
                return;
            }

            // 至少複製足夠的組數來填滿總寬度兩倍以達到無縫循環
            var neededGroups = Math.ceil((containerWidth * 2) / groupWidth) + 1;
            for (var i = 0; i < neededGroups; i++) {
                marqueeTrack.appendChild(createGroup());
            }

            var speed = 72; // px per second (原 60 加快 20%)
            var duration = (groupWidth / speed) * 1000;

            if (currentMarqueeAnim) currentMarqueeAnim.cancel();

            currentMarqueeAnim = marqueeTrack.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-' + groupWidth + 'px)' }
            ], {
                duration: duration,
                iterations: Infinity,
                easing: 'linear'
            });
        }

        buildMarquee();
        window.addEventListener('resize', function () {
            if (currentMarqueeAnim) currentMarqueeAnim.cancel();
            clearTimeout(window._marqueeResizeTimer);
            window._marqueeResizeTimer = setTimeout(buildMarquee, 200);
        });
    }

});