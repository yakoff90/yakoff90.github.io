// Плагін - налаштування та мітки українською мовою
(function() {
    'use strict';

    // === НАЛАШТУВАННЯ ПЛАГІНА (УКРАЇНСЬКОЮ) ===
    const pluginConfig = {
        title: 'Налаштування плагіна',
        sections: {
            streaming: {
                label: 'Стрімінги',
                description: 'Показувати блоки з онлайн-переглядом'
            },
            rental: {
                label: 'Новинки прокату',
                description: 'Показувати новинки кінопрокату'
            },
            ukrainian: {
                label: 'Новинки української стрічки',
                description: 'Показувати новинки українського кіно'
            }
        },
        badges: {
            quality: 'Показувати мітки якості',
            season: 'Показувати мітки сезону',
            year: 'Показувати мітки року'
        },
        qualityLabels: {
            hd: 'HD',
            fullhd: 'Повне HD',
            ultra: 'Ультра HD',
            fourK: '4K'
        },
        seasonLabels: {
            season: 'Сезон',
            season1: 'Сезон 1',
            season2: 'Сезон 2',
            season3: 'Сезон 3'
        },
        yearLabel: 'Рік'
    };

    // === СТВОРЕННЯ ПАНЕЛІ НАЛАШТУВАНЬ УКРАЇНСЬКОЮ ===
    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'plugin-settings';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1a1a2e;
            color: #eee;
            padding: 15px;
            border-radius: 12px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            min-width: 250px;
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                📺 ${pluginConfig.title}
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="showStreaming" checked>
                    <span>🎬 ${pluginConfig.sections.streaming.label}</span>
                </label>
                <small style="color: #aaa; margin-left: 24px;">${pluginConfig.sections.streaming.description}</small>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="showRental" checked>
                    <span>🍿 ${pluginConfig.sections.rental.label}</span>
                </label>
                <small style="color: #aaa; margin-left: 24px;">${pluginConfig.sections.rental.description}</small>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="showUkrainian" checked>
                    <span>🇺🇦 ${pluginConfig.sections.ukrainian.label}</span>
                </label>
                <small style="color: #aaa; margin-left: 24px;">${pluginConfig.sections.ukrainian.description}</small>
            </div>
            <hr style="margin: 10px 0; border-color: #333;">
            <div style="margin-bottom: 5px;"><strong>🏷️ Мітки:</strong></div>
            <div><small>✅ ${pluginConfig.badges.quality}</small></div>
            <div><small>✅ ${pluginConfig.badges.season}</small></div>
            <div><small>✅ ${pluginConfig.badges.year}</small></div>
            <div style="margin-top: 8px; font-size: 11px; color: #888; text-align: center;">
                ${pluginConfig.yearLabel} | ${pluginConfig.seasonLabels.season}
            </div>
        `;

        document.body.appendChild(panel);
        return panel;
    }

    // === ФУНКЦІЯ ПЕРЕКЛАДУ МІТОК НА КАРТКАХ ===
    function translateCardLabels() {
        // Переклад міток якості
        document.querySelectorAll('.quality, [class*="quality"]').forEach(el => {
            const text = el.textContent.trim();
            if (text === 'HD') el.textContent = pluginConfig.qualityLabels.hd;
            if (text === 'Full HD') el.textContent = pluginConfig.qualityLabels.fullhd;
            if (text === 'Ultra HD') el.textContent = pluginConfig.qualityLabels.ultra;
            if (text === '4K') el.textContent = pluginConfig.qualityLabels.fourK;
        });

        // Переклад міток сезону
        document.querySelectorAll('.season, [class*="season"]').forEach(el => {
            const text = el.textContent.trim();
            if (text === 'Season') el.textContent = pluginConfig.seasonLabels.season;
            if (text === 'Season 1') el.textContent = pluginConfig.seasonLabels.season1;
            if (text === 'Season 2') el.textContent = pluginConfig.seasonLabels.season2;
            if (text === 'Season 3') el.textContent = pluginConfig.seasonLabels.season3;
        });

        // Переклад міток року
        document.querySelectorAll('.year, [class*="year"]').forEach(el => {
            const text = el.textContent.trim();
            if (/^\d{4}$/.test(text) && !el.textContent.includes(pluginConfig.yearLabel)) {
                el.textContent = `${pluginConfig.yearLabel} ${text}`;
            }
        });
    }

    // === ЗАПУСК ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createSettingsPanel();
            translateCardLabels();
        });
    } else {
        createSettingsPanel();
        translateCardLabels();
    }
})();
