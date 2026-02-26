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
        '<div style="display:flex;flex-direction:column;align-items:center;gap:20px;">' +
        '<img src="assets/images/common/logo.png" alt="虹光LIVE" style="width:120px;height:auto;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style="width:50px;height:50px;">' +
        '<rect fill="#1B74D9" stroke="#1B74D9" stroke-width="2" width="30" height="30" x="25" y="85"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></rect>' +
        '<rect fill="#1B74D9" stroke="#1B74D9" stroke-width="2" width="30" height="30" x="85" y="85"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></rect>' +
        '<rect fill="#1B74D9" stroke="#1B74D9" stroke-width="2" width="30" height="30" x="145" y="85"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></rect>' +
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

    // === 搜尋功能 (console 偵測) ===
    var searchBtn = document.getElementById('searchBtn');
    var searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            var keyword = searchInput.value.trim();
            if (keyword) {
                console.log('🔍 搜尋關鍵字:', keyword);
            } else {
                console.log('⚠️ 請輸入搜尋關鍵字');
            }
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // === 手機版搜尋功能 (console 偵測) ===
    var mobileSearchBtn = document.getElementById('mobileSearchBtn');
    var mobileSearchInput = document.getElementById('mobileSearchInput');

    if (mobileSearchBtn && mobileSearchInput) {
        mobileSearchBtn.addEventListener('click', function () {
            var keyword = mobileSearchInput.value.trim();
            if (keyword) {
                console.log('🔍 手機版搜尋關鍵字:', keyword);
            } else {
                console.log('⚠️ 請輸入搜尋關鍵字');
            }
        });

        mobileSearchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                mobileSearchBtn.click();
            }
        });
    }
});