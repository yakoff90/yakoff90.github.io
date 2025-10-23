
// maxsm_themes_mint_fix.js
// Версія з універсальним SVG loader'ом ("стрибаючі палички"), який змінює колір відповідно до теми
// Підтримка Android + Samsung TV (Tizen)

(function () {
    'use strict';

    const THEME_COLORS = {
        mint_dark: '#00ffcc',
        crystal_cyan: '#00d4ff',
        deep_aurora: '#9d6bff',
        amber_noir: '#ffb300',
        velvet_sakura: '#ff4081',
        default: '#ffffff'
    };

    function createLoader(color) {
        const loader = document.createElement('div');
        loader.classList.add('custom-loader');
        loader.innerHTML = `
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
        <div class="loader-bar"></div>
        `;
        loader.querySelectorAll('.loader-bar').forEach(bar => bar.style.backgroundColor = color);
        return loader;
    }

    const style = document.createElement('style');
    style.textContent = `
    .custom-loader {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }
    .loader-bar {
        width: 6px;
        height: 20px;
        margin: 2px;
        background-color: var(--loader-color, #00ffcc);
        animation: jump 1s infinite ease-in-out;
    }
    .loader-bar:nth-child(1) { animation-delay: 0s; }
    .loader-bar:nth-child(2) { animation-delay: 0.1s; }
    .loader-bar:nth-child(3) { animation-delay: 0.2s; }
    .loader-bar:nth-child(4) { animation-delay: 0.3s; }
    .loader-bar:nth-child(5) { animation-delay: 0.4s; }

    @keyframes jump {
        0%, 100% { transform: scaleY(0.4); }
        50% { transform: scaleY(1.2); }
    }
    `;
    document.head.appendChild(style);

    // Основна функція застосування теми
    function applyTheme(theme) {
        const color = THEME_COLORS[theme] || THEME_COLORS.default;
        document.documentElement.style.setProperty('--loader-color', color);
    }

    // Заміна стандартного loader’а у Lampa
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && node.classList.contains('loader')) {
                    const theme = localStorage.getItem('interface_theme') || 'mint_dark';
                    const color = THEME_COLORS[theme] || THEME_COLORS.default;
                    node.innerHTML = '';
                    node.appendChild(createLoader(color));
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Реакція на зміну теми
    window.addEventListener('storage', e => {
        if (e.key === 'interface_theme') {
            applyTheme(e.newValue);
        }
    });

    console.log('%cmaxsm_themes_mint_fix.js — активовано з новим SVG loader'ом', 'color: #00ffcc');
})();
