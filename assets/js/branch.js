/**
 * branch.js — 分館首頁共用 JavaScript（永康 / 大直）
 * ==========================================
 * 全站共用邏輯請放 main.js
 * CSS  → assets/css/branch.css
 * HTML → yongkang.html / dazhi.html
 * ==========================================
 */

/* =============================================
   🔧 可手動調整的參數區 (翻牌動畫設定)
   ============================================= */

/** 手機版九宮格翻牌設定 (9 宮格) */
var FLIP_BRANCH_MOBILE = {
    counts: [9],
    stagger: 20,
    showDuration: 5000,
    interval: 5,
    initialDelay: 2000
};

/* =============================================
   DOMContentLoaded 主邏輯
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
       🔀 品牌九宮格隨機排序（手機版）
       ============================================= */
    (function shuffleBranchGrid() {
        var grid = document.querySelector('.branch-brands-grid .brands-equal-grid');
        if (grid) shuffleChildren(grid, '.brand-cell');
    })();

    /* =============================================
       Hero 品牌輪播 — 永康專用 (4 個品牌，不縮減)
       ============================================= */
    function initHeroSwiperYongkang() {
        var el = document.getElementById('heroBrandSwiper');
        if (!el || el.offsetParent === null) return; // 沒抓到或目前隱藏 (如在手機版) 就不執行
        var wrapper = el.querySelector('.swiper-wrapper');
        var slideCount = el.querySelectorAll('.swiper-slide').length;

        // 如果投影片數量在 2~8 之間，複製一份以確保 Loop 順暢不報錯 (slidesPerView 為 4)
        if (wrapper && slideCount >= 2 && slideCount <= 8) {
            var slides = wrapper.querySelectorAll('.swiper-slide');
            slides.forEach(function (s) {
                wrapper.appendChild(s.cloneNode(true));
            });
            slideCount = wrapper.querySelectorAll('.swiper-slide').length;
        }

        new Swiper('#heroBrandSwiper', {
            slidesPerView: 4,
            spaceBetween: 0,
            loop: slideCount > 4,
            autoplay: { delay: 3000, disableOnInteraction: false },
            navigation: {
                nextEl: '#heroBrandNext',
                prevEl: '#heroBrandPrev',
            },
        });
    }

    /* =============================================
       Hero 品牌輪播 — 大直專用 (7 個品牌，隨寬度縮減)
       ============================================= */
    function initHeroSwiperDazhi() {
        var el = document.getElementById('heroBrandSwiper');
        if (!el || el.offsetParent === null) return; // 沒抓到或目前隱藏 (如在手機版) 就不執行
        var wrapper = el.querySelector('.swiper-wrapper');
        var slideCount = el.querySelectorAll('.swiper-slide').length;

        // 如果投影片數量在 2~14 之間，複製一份以確保 Loop 順暢不報錯 (slidesPerView 為 7)
        if (wrapper && slideCount >= 2 && slideCount <= 14) {
            var slides = wrapper.querySelectorAll('.swiper-slide');
            slides.forEach(function (s) {
                wrapper.appendChild(s.cloneNode(true));
            });
            slideCount = wrapper.querySelectorAll('.swiper-slide').length;
        }

        new Swiper('#heroBrandSwiper', {
            slidesPerView: 7,
            spaceBetween: 0,
            loop: slideCount > 7,
            autoplay: { delay: 3000, disableOnInteraction: false },
            navigation: {
                nextEl: '#heroBrandNext',
                prevEl: '#heroBrandPrev',
            },
            breakpoints: {
                320: { slidesPerView: 2, spaceBetween: 10 },
                480: { slidesPerView: 3, spaceBetween: 20 },
                768: { slidesPerView: 4, spaceBetween: 20 },
                992: { slidesPerView: 6, spaceBetween: 25 },
                1200: { slidesPerView: 7, spaceBetween: 25 },
            },
        });
    }

    /* =============================================
       Hero 品牌輪播 — 依頁面自動選擇
       ============================================= */
    var heroSwiperEl = document.getElementById('heroBrandSwiper');
    if (heroSwiperEl) {
        // 隨機排序
        var heroSwiperWrapper = heroSwiperEl.querySelector('.swiper-wrapper');
        if (heroSwiperWrapper) shuffleChildren(heroSwiperWrapper, '.swiper-slide');

        // 依 data-slides-per-view 決定使用哪個初始化函式
        var maxSlides = parseInt(heroSwiperEl.getAttribute('data-slides-per-view') || 7, 10);
        if (maxSlides <= 4) {
            initHeroSwiperYongkang();
        } else {
            initHeroSwiperDazhi();
        }
    }

    /* =============================================
       品牌獨立 Swiper（手機版 + 桌機版都可用）
       ============================================= */
    var branchBrandSwiperWrapper = document.querySelector('#branchBrandSwiper .swiper-wrapper');
    if (branchBrandSwiperWrapper) shuffleChildren(branchBrandSwiperWrapper, '.swiper-slide');

    // 分開 yongkang 和 dazhi 的 brandBranchSwiper
    function initBranchBrandSwiperYongkang(slideCount) {
        var el = document.getElementById('branchBrandSwiper');
        if (!el || el.offsetParent === null) return; // 隱藏中就不執行
        new Swiper('#branchBrandSwiper', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: slideCount > 4, // 只有 4 個不算多，手機顯示 1~2 個，設 loop 容易 warning
            rewind: slideCount <= 4,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '#branchBrandNext',
                prevEl: '#branchBrandPrev',
            },
            breakpoints: {
                320: { slidesPerView: 2, spaceBetween: 10 },
                480: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                992: { slidesPerView: 4, spaceBetween: 25 },
            },
            watchOverflow: true,
        });
    }

    function initBranchBrandSwiperDazhi(slideCount) {
        var el = document.getElementById('branchBrandSwiper');
        if (!el || el.offsetParent === null) return; // 隱藏中就不執行
        var wrapper = el.querySelector('.swiper-wrapper');

        // 如果投影片數量在 2~12 之間，複製一份以確保 Loop 順暢不報錯 (Desktop slidesPerView 為 6)
        if (wrapper && slideCount >= 2 && slideCount <= 12) {
            var slides = wrapper.querySelectorAll('.swiper-slide');
            slides.forEach(function (s) {
                wrapper.appendChild(s.cloneNode(true));
            });
            slideCount = wrapper.querySelectorAll('.swiper-slide').length;
        }

        new Swiper('#branchBrandSwiper', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: slideCount > 6,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '#branchBrandNext',
                prevEl: '#branchBrandPrev',
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

    if (document.getElementById('branchBrandSwiper')) {
        var el = document.getElementById('branchBrandSwiper');
        var slideCount = el.querySelectorAll('.swiper-wrapper > .swiper-slide').length;

        if (slideCount <= 4) {
            initBranchBrandSwiperYongkang(slideCount);
        } else {
            initBranchBrandSwiperDazhi(slideCount);
        }
    }

    /* =============================================
       底部 Banner 輪播（桌機版 + 手機版）
       ============================================= */
    var footerBannerConfig = {
        slidesPerView: 1,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        speed: 800,
    };

    var footerDesktopEl = document.querySelector('.footer-banner-swiper');
    if (footerDesktopEl) {
        var slideCountDesktop = footerDesktopEl.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
        new Swiper('.footer-banner-swiper', Object.assign({}, footerBannerConfig, {
            pagination: { el: '.footer-pagination-desktop', clickable: true },
            loop: slideCountDesktop > 2,
            rewind: slideCountDesktop <= 2
        }));
    }

    var footerMobileEl = document.querySelector('.footer-banner-swiper-mobile');
    if (footerMobileEl) {
        var slideCountMobile = footerMobileEl.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
        new Swiper('.footer-banner-swiper-mobile', Object.assign({}, footerBannerConfig, {
            pagination: { el: '.footer-pagination-mobile', clickable: true },
            loop: slideCountMobile > 2,
            rewind: slideCountMobile <= 2
        }));
    }

    /* =============================================
       品牌九宮格翻牌動畫（手機版）
       ============================================= */
    initBranchAutoFlip();
});

/* =============================================
   翻牌邏輯
   ============================================= */
function initBranchAutoFlip() {
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

    // 手機版品牌九宮格翻牌
    var branchGrid = document.querySelector('.branch-brands-grid');
    if (branchGrid) {
        startFlipGroup(branchGrid, FLIP_BRANCH_MOBILE);
    }
}

