/**
 * 虹光 LIVE 網站核心邏輯
 * 1. 公告輪播 — 下進上出垂直切換
 *    可調整 NOTICE_INTERVAL 變更顯示秒數（預設 15 秒）
 */
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