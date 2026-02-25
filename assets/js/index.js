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

/** 每輪翻幾張的循環陣列，例如 [3, 2, 4] 代表第一輪翻3張、第二輪翻2張、第三輪翻4張，然後循環 */
var FLIP_COUNTS = [3, 2, 4];

/** 每輪翻牌的間隔秒數 */
var FLIP_INTERVAL = 5;

/** 同一輪中，每張卡片之間的翻牌延遲（毫秒），產生波浪效果 */
var FLIP_STAGGER = 200;

/** 卡片翻面後，多少毫秒後自動翻回正面 */
var FLIP_SHOW_DURATION = 3000;

/** 頁面載入後，多少毫秒開始第一輪翻牌 */
var FLIP_INITIAL_DELAY = 2000;

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

    /** 打亂某個容器內的子元素順序 */
    function shuffleChildren(parent, selector) {
        if (!parent) return;
        var items = Array.from(parent.querySelectorAll(':scope > ' + selector));
        if (items.length <= 1) return;
        shuffleArray(items);
        items.forEach(function (item) {
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
        new Swiper('#brandSwiper', {
            slidesPerView: 3,
            spaceBetween: 75,
            loop: true,
            loopAdditionalSlides: 3,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '#brandNextBtn',
                prevEl: '#brandPrevBtn',
            },
            breakpoints: {
                420: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                },
                992: {
                    slidesPerView: 6,
                    spaceBetween: 25,
                },
            },
        });
    }

    // --- Hero Banner hover 效果 (由 CSS .hero-desc-overlay 處理) ---

    // --- 底部 Banner 輪播（桌機版 + 手機版）---
    var footerBannerConfig = {
        slidesPerView: 1,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        speed: 800,
    };

    if (document.querySelector('.footer-banner-swiper')) {
        new Swiper('.footer-banner-swiper', footerBannerConfig);
    }
    if (document.querySelector('.footer-banner-swiper-mobile')) {
        new Swiper('.footer-banner-swiper-mobile', footerBannerConfig);
    }

    // --- 12 宮格自動隨機翻牌動畫 ---
    initAutoFlip();
});

/* =============================================
   12 宮格自動翻牌邏輯（桌機 + 手機版共用）
   ============================================= */
function initAutoFlip() {
    var sections = document.querySelectorAll('.brands-grid-section');
    if (sections.length === 0) return;

    sections.forEach(function (section) {
        var allCells = Array.from(section.querySelectorAll('.brand-cell'));
        // 排除有 .no-flip 的卡片（如第一張）
        var flippableCells = allCells.filter(function (cell) {
            return !cell.classList.contains('no-flip');
        });
        if (flippableCells.length === 0) return;

        // 目前在 FLIP_COUNTS 陣列中的索引
        var roundIndex = 0;

        /**
         * Fisher-Yates 洗牌
         */
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

        /**
         * 執行一輪翻牌
         */
        function autoFlipRound() {
            // 從陣列循環取出本輪翻牌數量
            var count = FLIP_COUNTS[roundIndex % FLIP_COUNTS.length];
            roundIndex++;

            // 確保不超過可翻牌片數
            count = Math.min(count, flippableCells.length);
            var candidates = shuffle(flippableCells).slice(0, count);

            candidates.forEach(function (cell, idx) {
                var flipCard = cell.querySelector('.flip-card');
                if (!flipCard || flipCard.classList.contains('flipped')) return;

                // 每張間隔 FLIP_STAGGER 毫秒依序翻牌
                setTimeout(function () {
                    flipCard.classList.add('flipped');

                    // FLIP_SHOW_DURATION 毫秒後翻回正面
                    setTimeout(function () {
                        flipCard.classList.remove('flipped');
                    }, FLIP_SHOW_DURATION);
                }, idx * FLIP_STAGGER);
            });
        }

        // 頁面載入後 FLIP_INITIAL_DELAY 毫秒開始第一輪
        setTimeout(function () {
            autoFlipRound();
            setInterval(autoFlipRound, FLIP_INTERVAL * 1000);
        }, FLIP_INITIAL_DELAY);
    });
}
