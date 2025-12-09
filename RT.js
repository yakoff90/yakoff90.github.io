(function() {
    'use strict';

    /**
     * =========================
     *  CONFIG
     * =========================
     */
    var LMP_ENH_CONFIG = {
        apiKeys: {
            mdblist: 'm8po461k1zq14sroj2ez5d7um', // ✅ ключ до MDBList
            omdb:    '12c9249c'     // ✅ ключ до OMDb
        },

        // true  -> іконки стають монохромні через filter: grayscale(100%)
        // false -> кольорові логотипи як є
        monochromeIcons: false   /*✅ Вкл./Викл. Ч/Б рейтинги */
    };

    /**
     * =========================
     *  ICON SOURCES
     * =========================
     */
    var ICONS = {
        // середній рейтинг (TOTAL)
        total_star: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/star.png',

        // інші нагороди (не Оскар / не Еммі)
        awards: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/awards.png',

        // PopcornMeter / Audience Score
        popcorn: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/popcorn.png',

        // Rotten Tomatoes поганий (гнилий)
        rotten_bad: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/RottenBad.png',

        // логотипи сервісів (з Enchanser)
        imdb:        'https://www.streamingdiscovery.com/logo/imdb.png',
        tmdb:        'https://www.streamingdiscovery.com/logo/tmdb.png',
        metacritic:  'https://www.streamingdiscovery.com/logo/metacritic.png',
        rotten_good: 'https://www.streamingdiscovery.com/logo/rotten-tomatoes.png'
    };

    /**
     * =========================
     *  CSS
     * =========================
     */
    var pluginStyles = "<style>" +
        ".loading-dots-container {" +
        "    display: flex;" +
        "    align-items: center;" +
        "    font-size: 0.85em;" +
        "    color: #ccc;" +
        "    padding: 0.6em 1em;" +
        "    border-radius: 0.5em;" +
        "}" +
        ".loading-dots__text {" +
        "    margin-right: 1em;" +
        "}" +
        ".loading-dots__dot {" +
        "    width: 0.5em;" +
        "    height: 0.5em;" +
        "    border-radius: 50%;" +
        "    background-color: currentColor;" +
        "    animation: loading-dots-bounce 1.4s infinite ease-in-out both;" +
        "}" +
        ".loading-dots__dot:nth-child(1) {" +
        "    animation-delay: -0.32s;" +
        "}" +
        ".loading-dots__dot:nth-child(2) {" +
        "    animation-delay: -0.16s;" +
        "}" +
        "@keyframes loading-dots-bounce {" +
        "    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }" +
        "    40% { transform: translateY(-0.5em); opacity: 1; }" +
        "}" +

        /* КОЛЬОРОВИЙ РЕЖИМ (за замовчуванням): */
        ".rate--oscars, .rate--emmy, .rate--awards, .rate--gold {" +
        "    color: gold;" +
        "}" +

        /* МОНОХРОМ РЕЖИМ: */
        "body.lmp-enh--mono .rate--oscars," +
        "body.lmp-enh--mono .rate--emmy," +
        "body.lmp-enh--mono .rate--awards," +
        "body.lmp-enh--mono .rate--gold," +
        "body.lmp-enh--mono .rating--green," +
        "body.lmp-enh--mono .rating--lime," +
        "body.lmp-enh--mono .rating--orange," +
        "body.lmp-enh--mono .rating--red," +
        "body.lmp-enh--mono .full-start__rate {" +
        "    color: inherit !important;" +
        "}" +

        ".full-start-new__rate-line .full-start__rate {" +
        "    margin-right: 0.3em !important;" +
        "}" +
        ".full-start-new__rate-line .full-start__rate:last-child {" +
        "    margin-right: 0 !important;" +
        "}" +
    "</style>";

    Lampa.Template.add('lmp_enh_styles', pluginStyles);
    $('body').append(Lampa.Template.get('lmp_enh_styles', {}, true));

    /**
     * =========================
     *  Rating Formatting and Colors
     * =========================
     */
    function getRatingClass(rating) {
        if (rating >= 8.0) return 'rating--green';  // Висока оцінка (зелений)
        if (rating >= 6.0) return 'rating--lime';   // Помірна оцінка (лайм)
        if (rating >= 5.5) return 'rating--orange'; // Низька оцінка (оранжевий)
        return 'rating--red';                       // Дуже низька оцінка (червоний)
    }

    function formatRating(rating) {
        if (rating !== null && !isNaN(rating)) {
            return rating.toFixed(1);  // Форматуємо оцінку до 1 десяткового знака
        }
        return 'N/A';  // Якщо оцінка недійсна, повертаємо 'N/A'
    }

    // Застосовуємо форматування та колір до ваших оцінок
    function updateRatingsDisplay() {
        var ratingElements = document.querySelectorAll('.rating-element');  // Оновіть правильний селектор

        ratingElements.forEach(function(element) {
            var rating = parseFloat(element.textContent);
            element.textContent = formatRating(rating);
            element.classList.add(getRatingClass(rating));  // Додаємо правильний клас для кольору
        });
    }

})();
