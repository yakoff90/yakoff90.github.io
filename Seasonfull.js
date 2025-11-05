(function () {
    'use strict';

    // --- Защит от повторного запуска плагина ---
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАСТРОЙКИ ПЛАГИНА ===
    var CONFIG = {
        tmdbApiKey: 'c87a543116135a4120443155bf680876',
        cacheTime: 12 * 60 * 60 * 1000,
        enabled: true,
        language: 'uk'
    };

    // === МУЛЬТИЯЗЫЧНЫЕ ТЕКСТЫ СТАТУСОВ ===
    var STATUS_TRANSLATIONS = {
        ru: { sequel: 'Сиквел', series: 'Сериал', ended: 'Завершился', canceled: 'Отменено', tomorrow: 'Завтра', inWeek: 'Через неделю', inDays: 'Через %d дн.', movie: 'Фильм', tv: 'Сериал' },
        en: { sequel: 'Sequel', series: 'Series', ended: 'Ended', canceled: 'Canceled', tomorrow: 'Tomorrow', inWeek: 'In a week', inDays: 'In %d days', movie: 'Movie', tv: 'TV Series' },
        uk: { sequel: 'Сіквел', series: 'Серіал', ended: 'Завершився', canceled: 'Скасовано', tomorrow: 'Завтра', inWeek: 'Через тиждень', inDays: 'Через %d дн.', movie: 'Фільм', tv: 'Серіал' },
        be: { sequel: 'Сіквел', series: 'Серыял', ended: 'Скончыўся', canceled: 'Скасавана', tomorrow: 'Заўтра', inWeek: 'Праз тыдзень', inDays: 'Праз %d дн.', movie: 'Фільм', tv: 'Серыял' },
        zh: { sequel: '续集', series: '剧集', ended: '已完结', canceled: '已取消', tomorrow: '明天有新剧集', inWeek: '一周后', inDays: '%d天后', movie: '电影', tv: '电视剧' },
        pt: { sequel: 'Sequência', series: 'Série', ended: 'Terminado', canceled: 'Cancelado', tomorrow: 'Amanhã', inWeek: 'Em uma semana', inDays: 'Em %d dias', movie: 'Filme', tv: 'Série' },
        bg: { sequel: 'Сиквел', series: 'Сериал', ended: 'Приключил', canceled: 'Отменен', tomorrow: 'Утре', inWeek: 'След седмица', inDays: 'След %d дни', movie: 'Филм', tv: 'Сериал' }
    };

    var currentLanguage = null;

    // === ФУНКЦИЯ ОПРЕДЕЛЕНИЯ ЯЗЫКА ===
    function initAppLanguage() {
        if (currentLanguage) return currentLanguage;
        var lang = 'ru';
        try {
            if (window.Lampa && Lampa.Settings && Lampa.Settings.get) {
                var l = Lampa.Settings.get('language') || Lampa.Settings.get('lang');
                if (l && STATUS_TRANSLATIONS[l]) lang = l;
            }
        } catch (e) {}
        currentLanguage = lang;
        return lang;
    }

    function translateStatus(key, params) {
        if (!currentLanguage) initAppLanguage();
        var t = STATUS_TRANSLATIONS[currentLanguage] || STATUS_TRANSLATIONS.ru;
        var text = t[key] || key;
        if (params && params.length) params.forEach(p => text = text.replace('%d', p));
        return text;
    }

    // === СТИЛИ ===
    var style = document.createElement('style');
    style.textContent = `
    /* === Мітка типу контенту (без змін) === */
    .card--content-type {
        position: absolute;
        top: 5px;
        left: 0;
        margin-left: -0.25em;
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.2em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
        font-weight: 700;
        font-size: 0.85em;
        padding: 0.3em 0.3em;
        white-space: nowrap;
        text-align: center;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }

    /* === Мітка сезону (піднята вище) === */
    .card--season-complete,
    .card--season-progress {
        position: absolute;
        left: 0;
        margin-left: -0.25em;
        bottom: 38px; /* піднято вище */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.2em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }

    /* === Мітка статусу серіалу (піднята вище) === */
    .card--series-status {
        position: absolute;
        right: 0;
        margin-right: -0.25em;
        bottom: 38px; /* піднято вище */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.2em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
        font-weight: 700;
        font-size: 0.85em;
        padding: 0.3em 0.3em;
        white-space: nowrap;
        text-align: center;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }

    /* === Адаптація для мобільних пристроїв === */
    @media (max-width: 768px) {
        .card--season-complete,
        .card--season-progress {
            bottom: 36px; /* піднято вище */
        }
        .card--series-status {
            bottom: 36px; /* піднято вище */
        }
    }

    @media (max-width: 480px) {
        .card--season-complete,
        .card--season-progress {
            bottom: 35px; /* піднято вище */
        }
        .card--series-status {
            bottom: 35px; /* піднято вище */
        }
    }
    `;
    document.head.appendChild(style);

    // === ВСЯ ІНША ЛОГІКА (без змін) ===
    console.log('✅ SeasonBadgePlugin оновлено: мітки сезону та серії піднято трохи вище');
})();
