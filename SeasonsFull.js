(function () {
    'use strict';

    // --- Захист від повторного запуску плагіна ---
    // Перевіряємо, чи плагін вже був ініціалізований
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    
    // Ініціалізуємо глобальний об'єкт плагіна
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАЛАШТУВАННЯ ПЛАГІНА ===
    var CONFIG = {
        tmdbApiKey: '27489d4d8c9dbd0f2b3e89f68821de34',  			  // API ключ для доступу до TMDB
        cacheTime: 24 * 60 * 60 * 1000,                   // Час зберігання кешу (24 години)
        enabled: true,                                    // Активувати/деактивувати плагін
        language: 'uk'                                    // Мова для запитів до TMDB
    };

    // === СТИЛІ ДЛЯ МІТОК СЕЗОНУ ===
    var style = document.createElement('style');
    style.textContent = `
    /* Стиль для ЗАВЕРШЕНИХ сезонів (зелена мітка) */
    .card--season-complete {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(61, 161, 141, 0.8);  /* Зелений колір */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    /* Стиль для НЕЗАВЕРШЕНИХ сезонів (жовта мітка з прогресом) */
    .card--season-progress {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(255, 193, 7, 0.8);   /* Жовтий колір */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    /* Загальні стилі для тексту в мітках - ОДИНАКОВІ ДЛЯ ОБОХ ТИПІВ */
    .card--season-complete div,
    .card--season-progress div {
        text-transform: uppercase;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;  /* Той самий шрифт */
        font-weight: 700;                                                    /* Той самий жирний шрифт */
        font-size: 1.05em;                                                   /* Той самий розмір */
        padding: 0.3em 0.4em;                                                /* Той самий відступ */
        white-space: nowrap;                                                 /* Той самий перенос */
        display: flex;                                                       /* Той самий flex */
        align-items: center;                                                 /* Той самий вирівнювання */
        gap: 4px;                                                            /* Той самий проміжок */
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }
    
    /* Колір тексту для завершених сезонів (білий на зеленому) */
    .card--season-complete div {
        color: #ffffff;  /* Білий текст для кращої видимості на зеленому фоні */
    }
    
    /* Колір тексту для незавершених сезонів (чорний на жовтому) */
    .card--season-progress div {
        color: #000000;  /* Чорний текст для кращої видимості на жовтому фоні */
    }
    
    /* Клас для плавного показу мітки */
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1;  /* Повна видимість при показі */
    }
    
    /* Адаптація для мобільних пристроїв */
    @media (max-width: 768px) {
        .card--season-complete div,
        .card--season-progress div {
            font-size: 0.95em;  /* Трохи менший розмір шрифту на мобільних */
            padding: 0.22em 0.5em; /* додано МЕНШІ ВІДСТУПИ НА МОБІЛЬНИХ */
        }
    }
    `;
    // Додаємо стилі до головної частини документа
    document.head.appendChild(style);

    // === ДОПОМІЖНІ ФУНКЦІЇ ===

    /** ... решта коду без змін ... */

})();