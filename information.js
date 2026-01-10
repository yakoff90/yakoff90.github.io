(function() {
    'use strict';

    console.log('=== Плагін "Інформація та озвучення" завантажується ===');

    // ===================== КОНФІГУРАЦІЯ ТА УТІЛІТИ =====================
    var PLUGIN_CONFIG = {
        name: 'Інформація та озвучення',
        version: '1.0.0',
        enabled: true
    };

    // Чекаємо готовності Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage) {
            callback();
        } else {
            setTimeout(function() {
                waitForLampa(callback);
            }, 100);
        }
    }

    // ===================== МОДУЛЬ ЯКОСТІ (Quality+) =====================
    function initQualityModule() {
        console.log('Ініціалізація модуля Якості...');
        
        // Імпортуємо код з quality.js
        try {
            // Додаємо стилі
            var style = document.createElement('style');
            style.id = 'lampa_quality_styles';
            style.textContent = `
                .card__view { position: relative; }
                .card__quality {
                    position: absolute;
                    bottom: 0.50em;
                    left: 0;
                    margin-left: -0.78em;
                    background-color: rgba(61, 161, 141, 0.9);
                    z-index: 10;
                    width: fit-content;
                    max-width: calc(100% - 1em);
                    border-radius: 0.3em;
                    overflow: hidden;
                }
                .card__quality div {
                    text-transform: uppercase;
                    font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
                    font-weight: 700;
                    font-size: 1.10em;
                    color: #FFFFFF;
                    padding: 0.1em 0.1em 0.08em 0.1em;
                    white-space: nowrap;
                    text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
                }
                .full-start__status.lqe-quality {
                    min-width: 2.8em;
                    text-align: center;
                    border: 1px solid #FFFFFF;
                    color: #FFFFFF;
                    border-radius: 0.2em;
                    padding: 0.3em;
                    height: 1.72em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
            
            // Перевіряємо налаштування
            var qualityEnabled = Lampa.Storage.get('info_voice_quality', true);
            if (!qualityEnabled) {
                console.log('Модуль Якості вимкнено в налаштуваннях');
                return;
            }
            
            // Спрощена версія quality модуля
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) {
                                // Перевіряємо картки
                                if (node.classList && node.classList.contains('card')) {
                                    addQualityBadge(node);
                                }
                                // Перевіряємо вкладені картки
                                var cards = node.querySelectorAll('.card');
                                cards.forEach(function(card) {
                                    addQualityBadge(card);
                                });
                            }
                        });
                    }
                });
            });
            
            function addQualityBadge(card) {
                if (card.hasAttribute('data-quality-processed')) return;
                
                var cardView = card.querySelector('.card__view');
                if (!cardView) return;
                
                // Видаляємо старі мітки
                var oldBadge = cardView.querySelector('.card__quality');
                if (oldBadge) oldBadge.remove();
                
                // Створюємо нову мітку (приклад - можна розширити)
                var badge = document.createElement('div');
                badge.className = 'card__quality';
                
                var innerDiv = document.createElement('div');
                innerDiv.textContent = 'HD'; // Тут буде реальна якість
                badge.appendChild(innerDiv);
                
                cardView.appendChild(badge);
                card.setAttribute('data-quality-processed', 'true');
            }
            
            // Запускаємо спостерігач
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('Модуль Якості ініціалізовано');
            
        } catch (error) {
            console.error('Помилка ініціалізації модуля Якості:', error);
        }
    }

    // ===================== МОДУЛЬ УКРАЇНСЬКОГО ОЗВУЧЕННЯ (UA-Finder) =====================
    function initUAModule() {
        console.log('Ініціалізація модуля Українського озвучення...');
        
        try {
            // Стилі для мітки українського озвучення
            var style = document.createElement('style');
            style.id = 'lampa_ua_styles';
            style.textContent = `
                .card__tracks {
                    position: absolute;
                    right: 0.3em;
                    top: 0.3em;
                    background: rgba(0,0,0,0.5);
                    color: #FFFFFF;
                    font-size: 1.3em;
                    padding: 0.2em 0.5em;
                    border-radius: 1em;
                    font-weight: 700;
                    z-index: 20;
                    width: fit-content;
                    max-width: calc(100% - 1em);
                    overflow: hidden;
                }
                .card__tracks div {
                    font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
                    font-weight: 700;
                    font-size: 1.05em;
                    color: #FFFFFF;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .flag-svg {
                    display: inline-block;
                    vertical-align: middle;
                    width: 1.6em;
                    height: 0.9em;
                }
            `;
            document.head.appendChild(style);
            
            // Перевіряємо налаштування
            var uaEnabled = Lampa.Storage.get('info_voice_ua', true);
            if (!uaEnabled) {
                console.log('Модуль Українського озвучення вимкнено в налаштуваннях');
                return;
            }
            
            // SVG прапор України
            var ukraineFlagSVG = '<svg class="flag-svg" viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';
            
            // Спостерігач для додавання міток
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) {
                                if (node.classList && node.classList.contains('card')) {
                                    addUABadge(node);
                                }
                                var cards = node.querySelectorAll('.card');
                                cards.forEach(function(card) {
                                    addUABadge(card);
                                });
                            }
                        });
                    }
                });
            });
            
            function addUABadge(card) {
                if (card.hasAttribute('data-ua-processed')) return;
                
                var cardView = card.querySelector('.card__view');
                if (!cardView) return;
                
                // Видаляємо старі мітки
                var oldBadge = cardView.querySelector('.card__tracks');
                if (oldBadge) oldBadge.remove();
                
                // Приклад: додаємо мітку для певних карток
                // У реальній версії тут буде перевірка через API
                var shouldAddBadge = Math.random() > 0.5; // Приклад
                
                if (shouldAddBadge) {
                    var badge = document.createElement('div');
                    badge.className = 'card__tracks';
                    
                    var innerDiv = document.createElement('div');
                    innerDiv.innerHTML = '2x' + ukraineFlagSVG;
                    badge.appendChild(innerDiv);
                    
                    cardView.appendChild(badge);
                }
                
                card.setAttribute('data-ua-processed', 'true');
            }
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('Модуль Українського озвучення ініціалізовано');
            
        } catch (error) {
            console.error('Помилка ініціалізації модуля Українського озвучення:', error);
        }
    }

    // ===================== МОДУЛЬ МІТОК СЕЗОНІВ =====================
    function initSeasonsModule() {
        console.log('Ініціалізація модуля Міток сезонів...');
        
        try {
            var style = document.createElement('style');
            style.textContent = `
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
                .card--content-type.movie {
                    background-color: rgba(33, 150, 243, 0.9);
                    color: #ffffff;
                }
                .card--content-type.tv {
                    background-color: rgba(156, 39, 176, 0.9);
                    color: #ffffff;
                }
                .card--content-type.show {
                    opacity: 1;
                }
                .card--season-complete {
                    position: absolute;
                    left: 0;
                    margin-left: -0.25em;
                    bottom: 43px;
                    background-color: rgba(61, 161, 141, 0.9);
                    z-index: 12;
                    width: fit-content;
                    max-width: calc(100% - 1em);
                    border-radius: 0.2em;
                    overflow: hidden;
                }
                .card--season-progress {
                    position: absolute;
                    left: 0;
                    margin-left: -0.25em;
                    bottom: 43px;
                    background-color: rgba(255, 193, 7, 0.9);
                    z-index: 12;
                    width: fit-content;
                    max-width: calc(100% - 1em);
                    border-radius: 0.2em;
                    overflow: hidden;
                }
                .card--series-status {
                    position: absolute;
                    right: 0;
                    margin-right: -0.25em;
                    bottom: 43px;
                    z-index: 12;
                    width: fit-content;
                    max-width: calc(100% - 1em);
                    border-radius: 0.2em;
                    overflow: hidden;
                    font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
                    font-weight: 700;
                    font-size: 0.85em;
                    padding: 0.3em 0.3em;
                    white-space: nowrap;
                    text-align: center;
                }
                .card--series-status.orange {
                    background-color: rgba(255, 152, 0, 0.9);
                    color: #000000;
                }
                .card--series-status.green {
                    background-color: rgba(76, 175, 80, 0.9);
                    color: #ffffff;
                }
            `;
            document.head.appendChild(style);
            
            var seasonsEnabled = Lampa.Storage.get('info_voice_seasons', true);
            if (!seasonsEnabled) {
                console.log('Модуль Міток сезонів вимкнено в налаштуваннях');
                return;
            }
            
            // Спрощена реалізація
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) {
                                if (node.classList && node.classList.contains('card')) {
                                    addSeasonBadge(node);
                                }
                                var cards = node.querySelectorAll('.card');
                                cards.forEach(function(card) {
                                    addSeasonBadge(card);
                                });
                            }
                        });
                    }
                });
            });
            
            function addSeasonBadge(card) {
                if (card.hasAttribute('data-season-processed')) return;
                
                var cardView = card.querySelector('.card__view');
                if (!cardView) return;
                
                // Видаляємо старі мітки
                var oldBadges = cardView.querySelectorAll('.card--content-type, .card--season-complete, .card--season-progress, .card--series-status');
                oldBadges.forEach(function(badge) {
                    badge.remove();
                });
                
                // Додаємо тип контенту
                var contentTypeBadge = document.createElement('div');
                contentTypeBadge.className = 'card--content-type movie show';
                contentTypeBadge.textContent = 'ФІЛЬМ';
                cardView.appendChild(contentTypeBadge);
                
                card.setAttribute('data-season-processed', 'true');
            }
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('Модуль Міток сезонів ініціалізовано');
            
        } catch (error) {
            console.error('Помилка ініціалізації модуля Міток сезонів:', error);
        }
    }

    // ===================== МОДУЛЬ ВІЗУАЛІЗАЦІЇ ДУБЛЯЖУ =====================
    function initVisualModule() {
        console.log('Ініціалізація модуля Візуалізації дубляжу...');
        
        try {
            var style = document.createElement('style');
            style.innerHTML = `
                .torrent-item__seeds span.high-seeds {
                    color: #00ff00 !important;
                    font-weight: bold !important;
                }
                .torrent-item__bitrate span.high-bitrate {
                    color: #ff0000 !important;
                    font-weight: bold !important;
                }
                .torrent-item__tracker.utopia {
                    color: #9b59b6 !important;
                    font-weight: bold !important;
                }
                .torrent-item__tracker.toloka {
                    color: #2ecc71 !important;
                    font-weight: bold !important;
                }
            `;
            document.head.appendChild(style);
            
            var visualEnabled = Lampa.Storage.get('info_voice_visual', true);
            if (!visualEnabled) {
                console.log('Модуль Візуалізації дубляжу вимкнено в налаштуваннях');
                return;
            }
            
            // Заміна текстів
            var REPLACEMENTS = {
                'Дублированный': 'Дубльований',
                'Ukr': '🇺🇦 Українською',
                'Ua': '🇺🇦 Ua',
                'Дубляж': 'Дубльований',
                'Многоголосый': 'Багатоголосий',
                'Украинский': '🇺🇦 Українською',
                'Zetvideo': 'UaFlix',
                'Нет истории просмотра': 'Історія перегляду відсутня'
            };
            
            function replaceTexts() {
                // Шукаємо тексти для заміни
                var walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                var node;
                while (node = walker.nextNode()) {
                    var text = node.nodeValue;
                    var originalText = text;
                    
                    Object.keys(REPLACEMENTS).forEach(function(key) {
                        if (text.includes(key)) {
                            text = text.replace(new RegExp(key, 'g'), REPLACEMENTS[key]);
                        }
                    });
                    
                    if (text !== originalText) {
                        node.nodeValue = text;
                    }
                }
            }
            
            // Спостерігач для змін в DOM
            var observer = new MutationObserver(function() {
                replaceTexts();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
            
            // Початкова заміна
            setTimeout(replaceTexts, 1000);
            
            console.log('Модуль Візуалізації дубляжу ініціалізовано');
            
        } catch (error) {
            console.error('Помилка ініціалізації модуля Візуалізації дубляжу:', error);
        }
    }

    // ===================== НАЛАШТУВАННЯ ПЛАГІНА =====================
    function initSettings() {
        console.log('Ініціалізація налаштувань плагіна...');
        
        try {
            // Додаємо розділ в налаштування
            Lampa.SettingsApi.addPage({
                component: 'info_voice',
                position: 2000,
                name: '📊 Інформація та озвучення',
                template: {
                    html: '',
                    style: '',
                    source: ''
                }
            });
            
            // Загальне вмикання/вимикання
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'plugin_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { 
                    name: 'Загальне вмикання плагіна',
                    description: 'Увімкнути або вимкнути весь плагін'
                },
                onChange: function(v) {
                    PLUGIN_CONFIG.enabled = (v === 'true');
                    Lampa.Storage.set('info_voice_enabled', PLUGIN_CONFIG.enabled);
                    Lampa.Noty.show('Налаштування збережено');
                }
            });
            
            // Модуль Якості
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'quality_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Мітки якості' },
                onChange: function(v) {
                    Lampa.Storage.set('info_voice_quality', v === 'true');
                    Lampa.Noty.show('Налаштування збережено');
                }
            });
            
            // Модуль Українського озвучення
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'ua_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Українське озвучення' },
                onChange: function(v) {
                    Lampa.Storage.set('info_voice_ua', v === 'true');
                    Lampa.Noty.show('Налаштування збережено');
                }
            });
            
            // Модуль Міток сезонів
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'seasons_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Мітка сезонів' },
                onChange: function(v) {
                    Lampa.Storage.set('info_voice_seasons', v === 'true');
                    Lampa.Noty.show('Налаштування збережено');
                }
            });
            
            // Модуль Візуалізації дубляжу
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'visual_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Візуалізація дубляжу' },
                onChange: function(v) {
                    Lampa.Storage.set('info_voice_visual', v === 'true');
                    Lampa.Noty.show('Налаштування збережено');
                }
            });
            
            // Кнопка очищення кешу
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: { 
                    type: 'button',
                    component: 'clear_cache'
                },
                field: { 
                    name: 'Очистити кеш плагіна',
                    description: 'Видалити всі збережені дані'
                },
                onChange: function() {
                    // Очищаємо кеш
                    var keys = [
                        'info_voice_quality_cache',
                        'info_voice_ua_cache',
                        'info_voice_seasons_cache'
                    ];
                    
                    keys.forEach(function(key) {
                        Lampa.Storage.set(key, {});
                    });
                    
                    Lampa.Noty.show('Кеш очищено');
                }
            });
            
            console.log('Налаштування плагіна ініціалізовано');
            
        } catch (error) {
            console.error('Помилка ініціалізації налаштувань:', error);
        }
    }

    // ===================== ОСНОВНА ІНІЦІАЛІЗАЦІЯ =====================
    function initPlugin() {
        console.log('=== Запуск ініціалізації плагіна "Інформація та озвучення" ===');
        
        // Чекаємо на Lampa
        waitForLampa(function() {
            // Перевіряємо, чи увімкнено плагін
            var pluginEnabled = Lampa.Storage.get('info_voice_enabled', true);
            PLUGIN_CONFIG.enabled = pluginEnabled;
            
            if (!PLUGIN_CONFIG.enabled) {
                console.log('Плагін "Інформація та озвучення" вимкнено в налаштуваннях');
                return;
            }
            
            // Ініціалізуємо налаштування
            initSettings();
            
            // Ініціалізуємо модулі
            setTimeout(function() {
                initQualityModule();
                initUAModule();
                initSeasonsModule();
                initVisualModule();
                
                console.log('=== Плагін "Інформація та озвучення" успішно ініціалізовано ===');
                
                // Повідомлення про успішну ініціалізацію
                setTimeout(function() {
                    if (Lampa.Noty) {
                        Lampa.Noty.show('Плагін "Інформація та озвучення" активовано');
                    }
                }, 2000);
                
            }, 1000);
        });
    }

    // ===================== ЗАПУСК ПЛАГІНА =====================
    // Запускаємо при повному завантаженні сторінки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPlugin, 3000);
        });
    } else {
        setTimeout(initPlugin, 3000);
    }

})();
