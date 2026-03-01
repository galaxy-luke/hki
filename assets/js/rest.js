// =============================================
// Store Hero Swiper
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    var storeHeroEl = document.querySelector('#storeHeroSwiper');
    if (storeHeroEl) {
        var slideCount = storeHeroEl.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
        new Swiper('#storeHeroSwiper', {
            loop: slideCount > 1,
            rewind: slideCount === 1,
            autoplay: { delay: 4000, disableOnInteraction: false },
            pagination: {
                el: '.store-hero-pagination',
                clickable: true,
            },
        });
    }
});
