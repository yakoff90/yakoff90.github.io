/**
 * @file RatingUp.js
 * @description РџР»Р°РіС–РЅ РґР»СЏ Lampa, СЏРєРёР№ РґРѕР·РІРѕР»СЏС” РїРµСЂРµРјС–С‰СѓРІР°С‚Рё СЂРµР№С‚РёРЅРі РЅР° РєР°СЂС‚РєР°С… Сѓ РІРµСЂС…РЅС–Р№ РїСЂР°РІРёР№ РєСѓС‚ С‚Р°/Р°Р±Рѕ СЂРѕР·С„Р°СЂР±РѕРІСѓРІР°С‚Рё Р№РѕРіРѕ Р·Р°Р»РµР¶РЅРѕ РІС–Рґ Р·РЅР°С‡РµРЅРЅСЏ.
 * @version 2.0
 */

(function() {
    'use strict';

    /**
     * Р“РѕР»РѕРІРЅР° С„СѓРЅРєС†С–СЏ РґР»СЏ С–РЅС–С†С–Р°Р»С–Р·Р°С†С–С— РїР»Р°РіС–РЅР°.
     * Р—Р°РїСѓСЃРєР°С”С‚СЊСЃСЏ РїС–СЃР»СЏ РїРѕРІРЅРѕС— РіРѕС‚РѕРІРЅРѕСЃС‚С– РґРѕРґР°С‚РєСѓ Lampa.
     */
    function startPlugin() {
        
        // --- Р‘Р»РѕРє РЅР°Р»Р°С€С‚СѓРІР°РЅСЊ ---
        var settings = {
            repositionRatings: Lampa.Storage.get('uprate_reposition_enabled', true),
            useColoredRatings: Lampa.Storage.get('uprate_colored_enabled', true)
        };

        if (!settings.repositionRatings && !settings.useColoredRatings) {
            console.log('UpRate plugin: РѕР±РёРґРІС– С„СѓРЅРєС†С–С— РІРёРјРєРЅРµРЅС– РІ РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏС….');
            return; 
        }

        console.log('UpRate plugin started:', 'reposition is ' + (settings.repositionRatings ? 'ON' : 'OFF'), 'coloring is ' + (settings.useColoredRatings ? 'ON' : 'OFF'));

        // --- Р‘Р»РѕРє РІРїСЂРѕРІР°РґР¶РµРЅРЅСЏ CSS ---
        if (settings.repositionRatings) {
            var style = document.createElement('style');
            style.innerHTML = [
                '/* РЎС‚РёР»С– Р·Р°СЃС‚РѕСЃРѕРІСѓСЋС‚СЊСЃСЏ С‚С–Р»СЊРєРё РґРѕ РєР°СЂС‚РѕРє, СЏРєС– РЅРµ РІ РїРѕРІРЅРѕРµРєСЂР°РЅРЅРѕРјСѓ СЂРµР¶РёРјС– */',
                '.card:not(.fullscreen) .card__vote {',
                '    top: 0.3em !important;',
                '    bottom: auto !important;',
                '    right: 0 !important;',
                '    left: auto !important;',
                '    border-radius: 0.4em 0 0 0.4em !important;',
                '    padding: 0.1em 0.3em !important;',
                '    background: rgba(0, 0, 0, 0.7) !important;',
                '    backdrop-filter: blur(5px) !important;',
                '}'
            ].join('\n');
            document.head.appendChild(style);
        }

        /**
         * Р—Р°СЃС‚РѕСЃРѕРІСѓС” РєРѕР»С–СЂ РґРѕ РµР»РµРјРµРЅС‚Р° РЅР° РѕСЃРЅРѕРІС– Р№РѕРіРѕ С‡РёСЃР»РѕРІРѕРіРѕ С‚РµРєСЃС‚РѕРІРѕРіРѕ РІРјС–СЃС‚Сѓ.
         * @param {HTMLElement} element - DOM-РµР»РµРјРµРЅС‚, С‰Рѕ РјС–СЃС‚РёС‚СЊ С‚РµРєСЃС‚ СЂРµР№С‚РёРЅРіСѓ.
         */
        function applyColorByRating(element) {
            if (!element) return;
            
            var voteText = element.textContent.trim();
            var match = voteText.match(/(\d+(\.\d+)?)/);

            if (!match) return;

            var vote = parseFloat(match[0]);
            
            // Р—Р°СЃС‚РѕСЃРѕРІСѓС”РјРѕ СЃС‚РёР»С– СЃРєСЂСѓРіР»РµРЅРЅСЏ С‚Р° С„РѕРЅСѓ РґР»СЏ РІСЃС–С… СЂРµР№С‚РёРЅРіС–РІ
            element.style.borderRadius = '8px 0 0 8px';
            element.style.padding = '0.1em 0.3em';
            element.style.background = 'rgba(0, 0, 0, 0.7)';
            element.style.backdropFilter = 'blur(5px)';
            
            // Р—Р°СЃС‚РѕСЃРѕРІСѓС”РјРѕ РєРѕР»С–СЂ С‚РµРєСЃС‚Сѓ Р·Р°Р»РµР¶РЅРѕ РІС–Рґ РґС–Р°РїР°Р·РѕРЅСѓ РѕС†С–РЅРєРё
            if (vote >= 8 && vote <= 10) {
                element.style.color = 'lawngreen';
            } else if (vote >= 6 && vote < 8) {
                element.style.color = 'cornflowerblue';
            } else if (vote > 3 && vote < 6) {
                element.style.color = 'orange';
            } else if (vote >= 0 && vote <= 3) {
                element.style.color = 'red';
            }
        }

        /**
         * РћСЃРЅРѕРІРЅР° С„СѓРЅРєС†С–СЏ РѕРЅРѕРІР»РµРЅРЅСЏ, СЏРєР° Р·Р°СЃС‚РѕСЃРѕРІСѓС” Р·РјС–РЅРё РґРѕ РµР»РµРјРµРЅС‚С–РІ Р· СЂРµР№С‚РёРЅРіР°РјРё.
         */
        function updateRatings() {
            
            // --- Р‘Р»РѕРє РѕРЅРѕРІР»РµРЅРЅСЏ РїРѕР·РёС†С–С— ---
            if (settings.repositionRatings) {
                var votesToPosition = document.querySelectorAll(".card__vote");
                for (var i = 0; i < votesToPosition.length; i++) {
                    var voteElement = votesToPosition[i];
                    if (!voteElement.closest('.fullscreen')) {
                        voteElement.style.position = "absolute";
                        voteElement.style.top = "0.3em";
                        voteElement.style.bottom = "auto";
                        voteElement.style.right = "0.3em";
                        voteElement.style.left = "auto";
                        voteElement.style.borderRadius = "8px 0 0 8px";
                        voteElement.style.padding = "0.1em 0.3em";
                        voteElement.style.background = "rgba(0, 0, 0, 0.7)";
                        voteElement.style.backdropFilter = "blur(5px)";
                    }
                }
            }

            // --- Р‘Р»РѕРє РѕРЅРѕРІР»РµРЅРЅСЏ РєРѕР»СЊРѕСЂСѓ ---
            if (settings.useColoredRatings) {
                var allRatingElements = document.querySelectorAll(
                    ".card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate"
                );
                for (var j = 0; j < allRatingElements.length; j++) {
                    applyColorByRating(allRatingElements[j]);
                }
            }
        }

        // --- Р‘Р»РѕРє С–РЅС–С†С–Р°Р»С–Р·Р°С†С–С— С‚Р° СЃРїРѕСЃС‚РµСЂРµР¶РµРЅРЅСЏ ---

        setTimeout(updateRatings, 500);
        setTimeout(updateRatings, 1500);
        
        // РџРµСЂРµРІС–СЂРєР° РїС–РґС‚СЂРёРјРєРё MutationObserver РґР»СЏ СЃС‚Р°СЂРёС… Р±СЂР°СѓР·РµСЂС–РІ
        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(updateRatings);
            observer.observe(document.body, { 
                childList: true,
                subtree: true
            });
        } else {
            // Р¤РѕР»Р±РµРє РґР»СЏ РґСѓР¶Рµ СЃС‚Р°СЂРёС… Р±СЂР°СѓР·РµСЂС–РІ - РїРµСЂС–РѕРґРёС‡РЅРµ РѕРЅРѕРІР»РµРЅРЅСЏ
            setInterval(updateRatings, 2000);
        }

        if (typeof Lampa !== 'undefined') {
            Lampa.Listener.follow('full', function (data) {
                if (data.type === 'complite') {
                    setTimeout(updateRatings, 150); 
                }
            });
        }
    }

    // --- Р‘Р»РѕРє Р·Р°РїСѓСЃРєСѓ РїР»Р°РіС–РЅР° ---
    if (typeof Lampa !== 'undefined') {
        if (window.appready) {
            startPlugin();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') startPlugin();
            });
        }
    } else {
        window.addEventListener('load', startPlugin);
    }
})();
