// Версія плагіну: 4.3 - Додано підтримку налаштувань
(function() {
    'use strict';

    const PLUGIN_NAME = 'UnifiedButtonManager';
    let observer = null;

    /* === Перевірка версії Lampa === */
    function isLampaVersionOrHigher(minVersion) {
        try {
            let version = null;

            if (window.Lampa?.Manifest?.app_version) version = Lampa.Manifest.app_version;
            else if (window.lampa_settings?.version) version = window.lampa_settings.version;
            else if (window.Lampa?.App?.version) version = Lampa.App.version;

            if (!version) return false;

            const current = parseInt(version.replace(/\./g, ''));
            const minimum = parseInt(minVersion.replace(/\./g, ''));

            return current >= minimum;
        } catch (e) {
            console.warn(`${PLUGIN_NAME}: Помилка перевірки версії`, e);
            return false;
        }
    }

    /* === CSS === */
    function addStyles() {
        if (!document.getElementById('unified-buttons-style')) {
            const style = document.createElement('style');
            style.id = 'unified-buttons-style';

            const customColors = Storage.get('unified_button_manager_custom_colors', false);

            style.textContent = `
                .full-start__button {
                    position: relative !important;
                    transition: transform 0.2s ease !important;
                }
                .full-start__button:active {
                    transform: scale(0.98) !important;
                }

                ${customColors ? `
                    .full-start__button.view--online svg path { fill: #4fc3f7 !important; }
                    .full-start__button.view--torrent svg path { fill: #c6ff00 !important; }
                    .full-start__button.view--trailer svg path { fill: #ff5252 !important; }
                ` : `
                    .full-start__button.view--online svg path { fill: #2196f3 !important; }
                    .full-start__button.view--torrent svg path { fill: lime !important; }
                    .full-start__button.view--trailer svg path { fill: #f44336 !important; }
                `}
            `;

            document.head.appendChild(style);
        }
    }

    const svgs = {
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path fill="currentColor" d="..."/></svg>`,
        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="currentColor" d="..."/></svg>`,
        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="..."/></svg>`,
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="currentColor" d="..."/></svg>`
    };

    /* === НАЛАШТУВАННЯ ПЛАГІНА === */
    function addPluginSettings() {
        if (!Lampa.Settings) return;

        // Назва розділу
        Lampa.Settings.addParam({
            component: 'more',
            param: { type: 'title' },
            field: { name: 'Unified Button Manager' }
        });

        // Увімкнути / Вимкнути плагін
        Lampa.Settings.addParam({
            component: 'more',
            param: {
                name: 'unified_button_manager_enabled',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Увімкнути плагін',
                description: 'Активувати або вимкнути керування кнопками'
            },
            onChange: (value) => {
                Storage.set('unified_button_manager_enabled', value);

                if (!value) {
                    stopObserver();
                    $('#unified-buttons-style').remove();
                } else {
                    addStyles();
                    if (Lampa.Activity.active())
                        processButtons({ object: Lampa.Activity.active() });
                }
            }
        });

        // Власні кольори
        Lampa.Settings.addParam({
            component: 'more',
            param: {
                name: 'unified_button_manager_custom_colors',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Кастомні кольори',
                description: 'Увімкнути індивідуальні кольори кнопок'
            },
            onChange: (value) => {
                Storage.set('unified_button_manager_custom_colors', value);
                $('#unified-buttons-style').remove();
                addStyles();
            }
        });
    }

    /* === ОБРОБКА КНОПОК (оригінальні функції) === */
    function processButtons(event) {
        try {
            const render = event.object.activity.render();

            let mainContainer = render.find('.full-start-new__buttons');
            if (!mainContainer.length) mainContainer = render.find('.full-start__buttons');
            if (!mainContainer.length) mainContainer = render.find('.buttons--container');

            const hiddenContainer = render.find('.buttons--container');

            if (!mainContainer.length) return;

            const torrentBtn = hiddenContainer.find('.view--torrent');
            const trailerBtn = hiddenContainer.find('.view--trailer');

            if (torrentBtn.length) mainContainer.append(torrentBtn.removeClass('hide').addClass('selector'));
            if (trailerBtn.length) mainContainer.append(trailerBtn.removeClass('hide').addClass('selector'));

            reorderButtons(mainContainer);

            setTimeout(updateButtons, 200);

        } catch (e) {
            console.error(`${PLUGIN_NAME}: Помилка обробки`, e);
        }
    }

    function reorderButtons(container) {
        container.css('display', 'flex');

        container.find('.full-start__button').each(function() {
            const button = $(this);
            const txt = button.text().toLowerCase();
            let order = 999;

            if (txt.includes('дивитись') || txt.includes('watch')) order = 0;
            else if (txt.includes('онлайн')) order = 1;
            else if (txt.includes('торрент')) order = 2;
            else if (txt.includes('трейлер')) order = 3;

            button.css('order', order);
        });
    }

    function updateButtons() {
        const map = {
            'view--torrent': svgs.torrent,
            'view--online': svgs.online,
            'view--trailer': svgs.trailer,
            'button--play': svgs.play
        };

        for (const cls in map) {
            $(`.${cls} svg`).each(function() {
                const oldSvg = $(this);
                oldSvg.replaceWith(map[cls]);
            });
        }
    }

    /* === OBSERVER === */
    function startObserver(event) {
        const render = event.object.activity.render();
        const mainContainer = render.find('.full-start-new__buttons')[0];
        if (!mainContainer) return;

        observer = new MutationObserver(() => updateButtons());
        observer.observe(mainContainer, { childList: true });
    }

    function stopObserver() {
        if (observer) observer.disconnect();
        observer = null;
    }

    /* === INIT === */
    function initPlugin() {
        if (!window.Lampa) return setTimeout(initPlugin, 100);

        // Додати настройки
        addPluginSettings();

        const enabled = Storage.get('unified_button_manager_enabled', true);
        if (!enabled) return;

        addStyles();

        Lampa.Listener.follow('full', function(event) {
            if (event.type === 'complite') {
                setTimeout(() => {
                    processButtons(event);
                    startObserver(event);
                }, 400);
            }
            if (event.type === 'destroy') stopObserver();
        });
    }

    // Реєстрація плагіна
    if (window.plugin) {
        window.plugin('unified_button_manager', {
            type: 'component',
            name: 'Unified Button Manager',
            version: '4.3',
            author: 'Merged Plugin',
            description: 'Управління кнопками + налаштування'
        });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', initPlugin)
        : initPlugin();

})();
