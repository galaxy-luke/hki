/**
 * index.js — 首頁專用 JavaScript
 * ==========================================
 * 全站共用邏輯請放 main.js
 * CSS  → assets/css/index.css
 * HTML → index.html (或 index_draft.html)
 * ==========================================
 */

/* =============================================
   🔧 可手動調整的參數區 (翻牌動畫設定)
   ============================================= */

/** 桌機版翻牌設定 (12 宮格) */
var FLIP_DESKTOP = {
    counts: [12],         // 一次全翻 12 張
    stagger: 20,          // 每張間隔 20ms
    showDuration: 5000,   // 翻面顯示 X 秒
    interval: 5,          // 每輪間隔 X 秒
    initialDelay: 2000    // 頁面載入後 X 秒開始
};

/** 手機版翻牌設定 (9 宮格) */
var FLIP_MOBILE = {
    counts: [9],           // 一次全翻 9 張
    stagger: 20,           // 每張間隔 20ms
    showDuration: 5000,    // 翻面顯示 X 秒
    interval: 5,           // 每輪間隔 X 秒
    initialDelay: 2000     // 頁面載入後 X 秒開始
};

/* =============================================
   品牌/商家區輪播 (Swiper)
   ============================================= */
document.addEventListener('DOMContentLoaded', function () {

    /* =============================================
       🔀 隨機排序工具函式 (Fisher-Yates Shuffle)
       ============================================= */
    function shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    /** 打亂某個容器內的子元素順序 (排除 fixed-cell) */
    function shuffleChildren(parent, selector) {
        if (!parent) return;
        var items = Array.from(parent.querySelectorAll(':scope > ' + selector));
        if (items.length <= 1) return;

        var fixedItems = [];
        var shuffleItems = [];
        items.forEach(function (item, index) {
            if (item.classList.contains('fixed-cell') || item.querySelector('.fixed-cell')) {
                fixedItems.push({ item: item, index: index });
            } else {
                shuffleItems.push(item);
            }
        });

        shuffleArray(shuffleItems);

        fixedItems.sort(function (a, b) { return a.index - b.index; });
        fixedItems.forEach(function (fi) {
            shuffleItems.splice(fi.index, 0, fi.item);
        });

        shuffleItems.forEach(function (item) {
            parent.appendChild(item);
        });
    }

    /* =============================================
       🔀 層級 3：12 宮格 / 9 宮格隨機排序
       ============================================= */
    // 桌機版：將所有 brand-cell 收集（排除 no-flip），打亂後重新分配到各 row
    (function shuffleDesktopGrid() {
        var section = document.querySelector('.brands-grid-section.d-none.d-lg-block');
        if (!section) return;
        var rows = Array.from(section.querySelectorAll('.brands-row'));
        if (rows.length === 0) return;

        // 收集所有 cell，分開 no-flip 和可打亂的
        var allCells = [];
        var noFlipCell = null;
        rows.forEach(function (row) {
            Array.from(row.children).forEach(function (cell) {
                if (cell.classList.contains('no-flip')) {
                    noFlipCell = cell;
                } else {
                    allCells.push(cell);
                }
            });
        });

        shuffleArray(allCells);

        // 把 no-flip 插回第一個位置
        if (noFlipCell) {
            allCells.unshift(noFlipCell);
        }

        // 重新分配到各 row（每 row 4 個）
        var perRow = 4;
        rows.forEach(function (row, idx) {
            // 清空 row
            while (row.firstChild) row.removeChild(row.firstChild);
            // 填入新的 cell
            var start = idx * perRow;
            var end = start + perRow;
            for (var i = start; i < end && i < allCells.length; i++) {
                row.appendChild(allCells[i]);
            }
        });
    })();

    // 手機版：大直 & 永康 tab 內的 col-4 隨機排序
    (function shuffleMobileGrids() {
        var dazhiRow = document.querySelector('#dazhi-brands .row');
        if (dazhiRow) shuffleChildren(dazhiRow, '.col-4');

        var yongkangRow = document.querySelector('#yongkang-brands .row');
        if (yongkangRow) shuffleChildren(yongkangRow, '.col-4');
    })();

    /* =============================================
       🔀 層級 4：品牌輪播 Swiper 隨機排序
       ============================================= */
    (function shuffleSwiperSlides() {
        var wrapper = document.querySelector('#brandSwiper .swiper-wrapper');
        if (wrapper) shuffleChildren(wrapper, '.swiper-slide');
    })();

    // --- Swiper 初始化 ---
    if (document.getElementById('brandSwiper')) {
        var brandSwiperEl = document.getElementById('brandSwiper');
        // 加入 offsetParent 判斷，如果元素目前隱藏 (例如在某些斷點下) 則不執行
        if (brandSwiperEl.offsetParent !== null) {
            var slideCount = brandSwiperEl.querySelectorAll('.swiper-slide').length;
            new Swiper('#brandSwiper', {
                slidesPerView: 1,
                spaceBetween: 10,
                loop: slideCount > 1,
                rewind: slideCount <= 1,
                loopAdditionalSlides: 2,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '#brandNextBtn',
                    prevEl: '#brandPrevBtn',
                },
                breakpoints: {
                    320: { slidesPerView: 2, spaceBetween: 10 },
                    480: { slidesPerView: 3, spaceBetween: 20 },
                    768: { slidesPerView: 4, spaceBetween: 20 },
                    992: { slidesPerView: 6, spaceBetween: 25 },
                },
                watchOverflow: true,
            });
        }
    }

    // --- Hero Banner hover 效果 (由 CSS .hero-desc-overlay 處理) ---

    // --- 底部 Banner 輪播（桌機版 + 手機版）---
    var footerBannerConfig = {
        slidesPerView: 1,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        speed: 800,
    };

    var footerDesktopEl = document.querySelector('.footer-banner-swiper');
    if (footerDesktopEl && footerDesktopEl.offsetParent !== null) {
        var slideCountDesktop = footerDesktopEl.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
        new Swiper('.footer-banner-swiper', Object.assign({}, footerBannerConfig, {
            pagination: { el: '.footer-pagination-desktop', clickable: true },
            loop: slideCountDesktop > 2,
            rewind: slideCountDesktop <= 2
        }));
    }

    var footerMobileEl = document.querySelector('.footer-banner-swiper-mobile');
    if (footerMobileEl && footerMobileEl.offsetParent !== null) {
        var slideCountMobile = footerMobileEl.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
        new Swiper('.footer-banner-swiper-mobile', Object.assign({}, footerBannerConfig, {
            pagination: { el: '.footer-pagination-mobile', clickable: true },
            loop: slideCountMobile > 2,
            rewind: slideCountMobile <= 2
        }));
    }

    // --- 12 宮格自動隨機翻牌動畫 ---
    initAutoFlip();
});

/* =============================================
   翻牌邏輯（桌機/手機版分別設定）
   桌機：12 宮格整體翻
   手機：大直 9 宮格 + 永康 9 宮格 各自獨立翻
   ============================================= */
function initAutoFlip() {
    // 共用的翻牌啟動函式
    function startFlipGroup(container, config) {
        var allCells = Array.from(container.querySelectorAll('.brand-cell'));
        var flippableCells = allCells.filter(function (cell) {
            return !cell.classList.contains('no-flip');
        });
        if (flippableCells.length === 0) return;

        var roundIndex = 0;

        function shuffle(arr) {
            var a = arr.slice();
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;
            }
            return a;
        }

        function autoFlipRound() {
            var count = config.counts[roundIndex % config.counts.length];
            roundIndex++;

            count = Math.min(count, flippableCells.length);
            var candidates = shuffle(flippableCells).slice(0, count);

            candidates.forEach(function (cell, idx) {
                var flipCard = cell.querySelector('.flip-card');
                if (!flipCard || flipCard.classList.contains('flipped')) return;

                setTimeout(function () {
                    flipCard.classList.add('flipped');

                    setTimeout(function () {
                        flipCard.classList.remove('flipped');
                    }, config.showDuration);
                }, idx * config.stagger);
            });
        }

        setTimeout(function () {
            autoFlipRound();
            setInterval(autoFlipRound, config.interval * 1000);
        }, config.initialDelay);
    }

    // 桌機版：整個 section 為一組（12 張）
    var desktopSection = document.querySelector('.brands-grid-section.d-none.d-lg-block');
    if (desktopSection) {
        startFlipGroup(desktopSection, FLIP_DESKTOP);
    }

    // 手機版：大直、永康各自獨立翻牌（各 9 張）
    var dazhiPane = document.querySelector('#dazhi-brands');
    if (dazhiPane) {
        startFlipGroup(dazhiPane, FLIP_MOBILE);
    }

    var yongkangPane = document.querySelector('#yongkang-brands');
    if (yongkangPane) {
        startFlipGroup(yongkangPane, FLIP_MOBILE);
    }
}
